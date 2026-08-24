/**
 * Deploy the ShadowDAO contract to the Midnight Preview network.
 *
 * Prerequisites:
 *   - A .env file with WALLET_SEED=<64-hex-char seed> (the Level 1 seed that owns DUST)
 *   - A funded tNIGHT balance on Preview (faucet: https://midnight-tmnight-preview.nethermind.dev)
 *   - A running local proof server: docker compose up -d proof-server
 *
 * Usage:
 *   npm run deploy:preview
 *
 * On success it writes the new contract address to .env.local as
 * VITE_CONTRACT_ADDRESS=... so the frontend picks it up automatically.
 */
import 'dotenv/config';
import { Buffer } from 'buffer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { sampleSigningKey, signingKeyFromBip340 } from '@midnight-ntwrk/compact-runtime';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import {
  WalletFacade,
  DustWallet,
  HDWallet,
  Roles,
  ShieldedWallet,
  createKeystore,
  NoOpTransactionHistoryStorage,
  PublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';

// @ts-expect-error wallet sync requires a global WebSocket in Node.js
globalThis.WebSocket = WebSocket;

const NETWORK = 'preview';
const NETWORK_CONFIG = {
  networkId: NETWORK,
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preview.midnight.network',
  proofServer: process.env.MIDNIGHT_PROOF_SERVER_URL?.trim() || 'http://127.0.0.1:6300',
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'managed');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

function loadPersistedState() {
  const dir = path.resolve(__dirname, '..', '.midnight-wallet-state', NETWORK);
  const out: { shielded?: unknown; unshielded?: unknown; dust?: string } = {};
  try {
    for (const kind of ['shielded', 'unshielded', 'dust'] as const) {
      const file = path.join(dir, `${kind}.json`);
      if (fs.existsSync(file)) {
        const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
        out[kind] = raw?.state;
      }
    }
  } catch (e) {
    console.warn('   ⚠ Could not read persisted wallet state:', (e as Error).message);
  }
  return out;
}

async function persistWalletState(w: any) {
  const dir = path.resolve(__dirname, '..', '.midnight-wallet-state', NETWORK);
  fs.mkdirSync(dir, { recursive: true });
  const children: Record<string, string> = {
    shielded: 'shielded.json',
    unshielded: 'unshielded.json',
    dust: 'dust.json',
  };
  for (const [kind, fileName] of Object.entries(children)) {
    try {
      const child = (w as Record<string, { serializeState: () => Promise<unknown> }>)[kind];
      const serialized = await child.serializeState();
      fs.writeFileSync(path.join(dir, fileName), JSON.stringify({ version: 1, state: serialized }));
    } catch (e) {
      console.warn(`   ⚠ Could not persist ${kind} wallet state:`, (e as Error).message);
    }
  }
}

async function main() {
  console.log('\n=== ShadowDAO Deployment to Preview ===\n');

  const seed = process.env.WALLET_SEED?.trim();
  if (!seed) {
    console.error('❌ WALLET_SEED is not set. Create a .env file from .env.example with your Level 1 seed.');
    process.exit(1);
  }
  if (!/^[0-9a-fA-F]{64}$/.test(seed)) {
    console.error('❌ WALLET_SEED must be a 64-character hex seed (32 bytes).');
    process.exit(1);
  }

  if (!fs.existsSync(contractPath)) {
    console.error('❌ Compiled contract not found at managed/contract/index.js.');
    process.exit(1);
  }

  setNetworkId(NETWORK);
  const contractModule = await import(pathToFileURL(contractPath).href);

  const compiledContract = CompiledContract.make('shadow_dao', contractModule.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

  // --- Wallet setup ---------------------------------------------------------
  console.log('1. Creating wallet from seed...');
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const keys = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (keys.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();

  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys.keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys.keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys.keys[Roles.NightExternal], NETWORK);

  const walletConfig = {
    networkId: NETWORK,
    indexerClientConnection: {
      indexerHttpUrl: NETWORK_CONFIG.indexer,
      indexerWsUrl: NETWORK_CONFIG.indexerWS,
    },
    provingServerUrl: new URL(NETWORK_CONFIG.proofServer),
    relayURL: new URL(NETWORK_CONFIG.node.replace(/^http/, 'ws')),
    txHistoryStorage: new NoOpTransactionHistoryStorage(),
    costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
  };

  const saved = loadPersistedState();

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: async (config) => {
      const cls = ShieldedWallet(config);
      if (saved.shielded !== undefined) {
        try {
          return await (cls as any).restore(saved.shielded);
        } catch (e) {
          console.warn('   ⚠ Shielded restore failed, syncing fresh:', (e as Error).message);
        }
      }
      return cls.startWithSecretKeys(shieldedSecretKeys);
    },
    unshielded: async (config) => {
      const cls = UnshieldedWallet(config);
      if (saved.unshielded !== undefined) {
        try {
          return await (cls as any).restore(saved.unshielded);
        } catch (e) {
          console.warn('   ⚠ Unshielded restore failed, syncing fresh:', (e as Error).message);
        }
      }
      return cls.startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore));
    },
    dust: async (config) => {
      const cls = DustWallet(config);
      if (saved.dust !== undefined) {
        try {
          return await (cls as any).restore(saved.dust);
        } catch (e) {
          console.warn('   ⚠ DUST restore failed, syncing fresh:', (e as Error).message);
        }
      }
      return cls.startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust);
    },
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);

  console.log('2. Syncing with network (may take a few minutes)...');
  const state = await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5000),
      Rx.filter((s) => s.isSynced),
    ),
  );

  const address = unshieldedKeystore.getBech32Address().toString();
  const balance = state.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
  console.log(`   Wallet: ${address}`);
  console.log(`   tNIGHT balance: ${balance.toLocaleString()}`);

  await persistWalletState(wallet);

  if (balance === 0n) {
    console.error('\n❌ Wallet has 0 tNIGHT. Fund it from the Preview faucet first:');
    console.error('   https://midnight-tmnight-preview.nethermind.dev\n');
    await wallet.stop();
    process.exit(1);
  }

  // --- DUST registration ----------------------------------------------------
  console.log('3. Checking DUST...');
  const dustState = await Rx.firstValueFrom(wallet.state().pipe(Rx.filter((s) => s.isSynced)));
  const unregistered = dustState.unshielded.availableCoins.filter(
    (c: any) => !c.meta?.registeredForDustGeneration,
  );
  if (unregistered.length > 0) {
    console.log(`   Registering ${unregistered.length} NIGHT UTXOs for DUST generation...`);
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      unregistered,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
    );
    const finalized = await wallet.finalizeRecipe(recipe);
    await wallet.submitTransaction(finalized);
  }

  if (dustState.dust.balance(new Date()) === 0n) {
    console.log('   Waiting for DUST tokens to accrue...');
    await Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    );
  }
  console.log('   DUST ready!\n');

  // --- Providers ------------------------------------------------------------
  console.log('4. Building providers...');
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);

  const walletAndMidnightProvider = {
    getCoinPublicKey: () => shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      const recipe = await wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys, dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      return wallet.finalizeRecipe(recipe);
    },
    submitTx: (tx: any) => wallet.submitTransaction(tx) as any,
  };

  const providers = {
    publicDataProvider: indexerPublicDataProvider(NETWORK_CONFIG.indexer, NETWORK_CONFIG.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(NETWORK_CONFIG.proofServer, zkConfigProvider),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };

  // --- Deploy ---------------------------------------------------------------
  console.log('5. Deploying ShadowDAO contract (generating ZK proof + submitting)...');
  const deployTxData = await createUnprovenDeployTx(
    { zkConfigProvider, walletProvider: walletAndMidnightProvider },
    {
      compiledContract: compiledContract as any,
      args: [],
      initialPrivateState: {},
      signingKey: signingKeyFromBip340(Buffer.from(seed, 'hex')),
    },
  );

  const contractAddress = deployTxData.public.contractAddress;
  console.log(`   Contract address: ${contractAddress}`);

  const checkRes = await fetch(NETWORK_CONFIG.indexer, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `query($address: HexEncoded!) { contractAction(address: $address) { state } }`,
      variables: { address: contractAddress },
    }),
  });
  const checkPayload: any = await checkRes.json();
  const alreadyDeployed = !!checkPayload?.data?.contractAction?.state;

  if (alreadyDeployed) {
    console.log('   Contract is already deployed. Skipping deployment transaction.');
  } else {
    await submitTxAsync(providers as any, { unprovenTx: deployTxData.private.unprovenTx });

    console.log('6. Waiting for the contract to be indexed...');
    await waitForContractDeployment(contractAddress);
  }

  // --- Persist address for the frontend -------------------------------------
  const envLocalPath = path.resolve(__dirname, '..', '.env.local');
  const existing = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, 'utf-8') : '';
  const updated = existing
    .split('\n')
    .filter((line) => line.trim() !== '' && !line.startsWith('VITE_CONTRACT_ADDRESS'))
    .concat([`VITE_CONTRACT_ADDRESS=${contractAddress}`])
    .join('\n') + '\n';
  fs.writeFileSync(envLocalPath, updated);

  console.log('\n✅ ShadowDAO deployment complete!');
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Written to .env.local (VITE_CONTRACT_ADDRESS)`);
  console.log('   Next: paste this address into README.md, then `npm run dev`.\n');

  await wallet.stop();
}

async function waitForContractDeployment(contractAddress: string, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(NETWORK_CONFIG.indexer, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: `query($address: HexEncoded!) { contractAction(address: $address) { state } }`,
          variables: { address: contractAddress },
        }),
      });
      const payload: any = await res.json();
      if (payload?.data?.contractAction?.state) return;
    } catch {
      // indexer may lag — keep polling
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.warn('   ⚠ Contract not confirmed by the indexer yet. It may still land.');
}

main().catch(async (err: any) => {
  console.error('❌ Deployment failed:', err?.message ?? err);
  process.exit(1);
});