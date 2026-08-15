/**
 * Integration smoke test: create a proposal, then cast a vote, against the
 * deployed ShadowDAO contract on Preview. Mirrors the frontend's submitVote /
 * createProposal logic but driven from the wallet SDK in Node.
 *
 * Usage: tsx scripts/smoke-test.ts
 */
import 'dotenv/config';
import { Buffer } from 'buffer';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
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
import { ledger as contractLedger } from '../managed/contract/index.js';

// @ts-expect-error wallet sync requires a global WebSocket in Node.js
globalThis.WebSocket = WebSocket;

const NETWORK = 'preview';
const CONTRACT_ADDRESS = '46f9aca1ab2ab489997a9e3f1262922927bb38c3a648d43fab237fd8d5a733dc';
const NETWORK_CONFIG = {
  networkId: NETWORK,
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preview.midnight.network',
  proofServer: process.env.MIDNIGHT_PROOF_SERVER_URL?.trim() || 'http://127.0.0.1:6300',
};

const zkConfigPath = new URL('../managed', import.meta.url).pathname;

async function main() {
  const seed = process.env.WALLET_SEED!.trim();
  setNetworkId(NETWORK);

  const contractModule = await import(new URL('../managed/contract/index.js', import.meta.url).href);
  const compiledContract = CompiledContract.make('shadow_dao', contractModule.Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(zkConfigPath),
  );

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

  const wallet = await WalletFacade.init({
    configuration: walletConfig,
    shielded: (config) => ShieldedWallet(config).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (config) => UnshieldedWallet(config).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (config) => DustWallet(config).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
  });
  await wallet.start(shieldedSecretKeys, dustSecretKey);

  console.log('Syncing wallet...');
  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5000),
      Rx.filter((s) => s.isSynced),
    ),
  );
  console.log('Synced.');

  const providers = {
    publicDataProvider: indexerPublicDataProvider(NETWORK_CONFIG.indexer, NETWORK_CONFIG.indexerWS),
    zkConfigProvider: new NodeZkConfigProvider(zkConfigPath),
    proofProvider: httpClientProofProvider(NETWORK_CONFIG.proofServer, new NodeZkConfigProvider(zkConfigPath)),
    walletProvider: {
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
    },
    midnightProvider: {
      submitTx: (tx: any) => wallet.submitTransaction(tx) as any,
    },
  };

  async function waitForProposalCount(expected: number) {
    for (let i = 0; i < 20; i++) {
      const res = await fetch(NETWORK_CONFIG.indexer, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: `query($address: HexEncoded!) { contractAction(address: $address) { state } }`,
          variables: { address: CONTRACT_ADDRESS },
        }),
      });
      const payload: any = await res.json();
      if (payload?.data?.contractAction?.state) {
        const { ContractState } = await import('@midnight-ntwrk/compact-runtime');
        const cs = ContractState.deserialize(Uint8Array.from(Buffer.from(payload.data.contractAction.state, 'hex')));
        const l = contractLedger(cs.data) as any;
        if (!l.proposals.isEmpty() && l.proposals.size() >= BigInt(expected)) {
          console.log(`Proposals now: ${l.proposals.size().toString()}`);
          return l;
        }
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    throw new Error('Timed out waiting for proposals to update');
  }

  const CONTRACT_ID = 9001n;
  console.log('\n=== Creating proposal ===');
  const createTxData = await createUnprovenCallTx(providers as any, {
    compiledContract,
    contractAddress: CONTRACT_ADDRESS,
    circuitId: 'create_proposal',
    args: [CONTRACT_ID, 'Integration Test Proposal', 'Created by smoke-test.ts'],
  });
  await submitTxAsync(providers as any, { unprovenTx: createTxData.private.unprovenTx, circuitId: 'create_proposal' });
  console.log('create_proposal submitted, waiting for index...');
  const l1 = await waitForProposalCount(1);
  for (const [id, p] of l1.proposals) {
    console.log('  Proposal:', id.toString(), '|', p.title, '| yes:', p.yes.toString(), 'no:', p.no.toString(), 'abstain:', p.abstain.toString());
  }

  console.log('\n=== Casting vote (choice=0 YES) ===');
  const secret = new Uint8Array(32);
  secret.fill(42);
  const voteTxData = await createUnprovenCallTx(providers as any, {
    compiledContract,
    contractAddress: CONTRACT_ADDRESS,
    circuitId: 'vote',
    args: [CONTRACT_ID, 0n, secret],
  });
  await submitTxAsync(providers as any, { unprovenTx: voteTxData.private.unprovenTx, circuitId: 'vote' });
  console.log('vote submitted, waiting for index...');

  for (let i = 0; i < 20; i++) {
    const res = await fetch(NETWORK_CONFIG.indexer, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query($address: HexEncoded!) { contractAction(address: $address) { state } }`,
        variables: { address: CONTRACT_ADDRESS },
      }),
    });
    const payload: any = await res.json();
    const { ContractState } = await import('@midnight-ntwrk/compact-runtime');
    const cs = ContractState.deserialize(Uint8Array.from(Buffer.from(payload.data.contractAction.state, 'hex')));
    const l = contractLedger(cs.data) as any;
    for (const [id, p] of l.proposals) {
      if (id === CONTRACT_ID) {
        console.log('  Tally after vote -> yes:', p.yes.toString(), 'no:', p.no.toString(), 'abstain:', p.abstain.toString());
        if (p.yes >= 1n) {
          console.log('\n✅ Integration test passed!');
          await wallet.stop();
          process.exit(0);
        }
      }
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log('\n❌ Vote tally did not update.');
  await wallet.stop();
  process.exit(1);
}

main().catch(async (err) => {
  console.error('❌ Smoke test failed:', err?.message ?? err);
  process.exit(1);
});
