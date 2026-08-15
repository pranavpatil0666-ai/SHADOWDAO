import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { createUnprovenCallTx, createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger } from '../managed/contract/index.js';

export type ConnectedSession = {
  api: any;
  providers: {
    zkConfigProvider: FetchZkConfigProvider<any>;
    proofProvider: { proveTx: (unprovenTx: any, _config: any) => Promise<any> };
    walletProvider: any;
    midnightProvider: any;
    publicDataProvider: any;
    privateStateProvider: any;
  };
  unshieldedAddress: string;
  config: any;
};

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error('Invalid hex string from wallet.');
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

// Detect the injected wallet. 1AM injects as window.midnight['1am'] and
// exposes .connect(networkId). Lace injects as window.midnight.mnLace and
// exposes .enable(). We prefer 1AM, falling back to Lace.
export async function detectWallet(): Promise<{ provider: any; type: '1am' | 'lace' } | null> {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const midnight = (window as any).midnight;
      if (midnight?.['1am']) {
        resolve({ provider: midnight['1am'], type: '1am' });
        return;
      }
      if (midnight?.mnLace) {
        resolve({ provider: midnight.mnLace, type: 'lace' });
        return;
      }
      if (++attempts > 50) {
        resolve(null);
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}

// Poll for the wallet, then connect it and build a full provider session.
export async function connectAndBuildSession(networkId = 'preview'): Promise<ConnectedSession> {
  const wallet = await detectWallet();
  if (!wallet) throw new Error('1AM wallet not installed');

  const api = wallet.type === '1am'
    ? await wallet.provider.connect(networkId)
    : await wallet.provider.enable();

  const [config, unshieldedAddress, shieldedAddress] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/contract/shadow-dao', window.location.origin).toString(),
    window.fetch.bind(window),
  );

  zkConfigProvider.getZKIR('vote').then(
    (zkir) => console.log('[zkConfigProvider] getZKIR vote ok, length:', zkir?.length),
    (err) => console.error('[zkConfigProvider] getZKIR vote failed — check ZK asset hosting:', err),
  );

  const provingProvider = await api.getProvingProvider(zkConfigProvider);

  const proofProvider = {
    async proveTx(unprovenTx: any, _config: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const walletProvider = {
    getCoinPublicKey: () => shieldedAddress.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddress.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      if (!balanced?.tx) throw new Error('balanceUnsealedTransaction returned invalid result');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  const midnightProvider = {
    submitTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const result = await api.submitTransaction(txHex);
      if (typeof result === 'string' && result) return result;
      if (result?.transactionId) return result.transactionId;
      if (result?.id) return result.id;
      return txHex.slice(0, 64);
    },
  };

  const publicDataProvider = indexerPublicDataProvider(config.indexerUri, config.indexerWsUri);

  const privateStateProvider = createPrivateStateProvider();

  return {
    api,
    config,
    providers: {
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
      publicDataProvider,
      privateStateProvider,
    },
    unshieldedAddress: unshieldedAddress.unshieldedAddress,
  };
}



export function createPrivateStateProvider() {
  let scope = '';
  const stateStore = new Map<string, unknown>();
  const signingKeyStore = new Map<string, unknown>();
  const key = (id: string) => `${scope}:${id}`;

  return {
    setContractAddress(address: string) { scope = address; },
    async set(id: string, state: unknown) { stateStore.set(key(id), state); },
    async get(id: string) { return stateStore.get(key(id)) ?? null; },
    async remove(id: string) { stateStore.delete(key(id)); },
    async clear() { stateStore.clear(); },
    async setSigningKey(addr: string, k: unknown) { signingKeyStore.set(addr, k); },
    async getSigningKey(addr: string) { return signingKeyStore.get(addr) ?? null; },
    async removeSigningKey(addr: string) { signingKeyStore.delete(addr); },
    async clearSigningKeys() { signingKeyStore.clear(); },
    async exportPrivateStates(): Promise<never> { throw new Error('Not implemented.'); },
    async importPrivateStates(): Promise<never> { throw new Error('Not implemented.'); },
    async exportSigningKeys(): Promise<never> { throw new Error('Not implemented.'); },
    async importSigningKeys(): Promise<never> { throw new Error('Not implemented.'); },
  };
}

export function getCompiledContract() {
  return CompiledContract.make('shadow_dao', Contract as any).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets('/contract/shadow-dao'),
  ) as any;
}

export interface ProposalLedger {
  id: bigint;
  title: string;
  description: string;
  yes: bigint;
  no: bigint;
  abstain: bigint;
}

// Read the real on-chain ledger state (proposals map + nullifier count).
export async function getProposals(session: ConnectedSession, contractAddress: string): Promise<ProposalLedger[]> {
  const contractState = await session.providers.publicDataProvider.queryContractState(contractAddress);
  if (!contractState?.data) return [];

  const l = ledger(contractState.data) as any;
  const proposals: ProposalLedger[] = [];
  if (l.proposals && !l.proposals.isEmpty()) {
    for (const [id, p] of l.proposals) {
      proposals.push({
        id,
        title: p.title,
        description: p.description,
        yes: p.yes,
        no: p.no,
        abstain: p.abstain,
      });
    }
  }
  return proposals.sort((a, b) => (a.id < b.id ? 1 : -1));
}

export async function getTotalVotes(session: ConnectedSession, contractAddress: string): Promise<number> {
  const proposals = await getProposals(session, contractAddress);
  return proposals.reduce((sum, p) => sum + Number(p.yes) + Number(p.no) + Number(p.abstain), 0);
}

export async function getWalletBalances(session: ConnectedSession): Promise<{
  unshielded: Record<string, bigint>;
  shielded: Record<string, bigint>;
  dust: { balance: bigint; cap: bigint } | null;
}> {
  const [unshielded, shielded, dust] = await Promise.all([
    session.api.getUnshieldedBalances(),
    session.api.getShieldedBalances(),
    session.api.getDustBalance?.().catch(() => null),
  ]);
  return { unshielded, shielded, dust };
}

// Submit a real vote transaction to the contract through the 1AM wallet.
export async function submitVote(
  session: ConnectedSession,
  contractAddress: string,
  proposalId: bigint,
  choice: number,
): Promise<string> {
  const secret = crypto.getRandomValues(new Uint8Array(32));

  const callTxData = await createUnprovenCallTx(session.providers as any, {
    compiledContract: getCompiledContract(),
    contractAddress,
    circuitId: 'vote',
    args: [proposalId, BigInt(choice), secret],
  });

  const txId = await submitTxAsync(session.providers as any, {
    unprovenTx: callTxData.private.unprovenTx,
    circuitId: 'vote',
  });

  return typeof txId === 'string' ? txId : toHex(new Uint8Array(32));
}

// Create a real proposal on-chain.
export async function createProposal(
  session: ConnectedSession,
  contractAddress: string,
  proposalId: bigint,
  title: string,
  description: string,
): Promise<string> {
  const callTxData = await createUnprovenCallTx(session.providers as any, {
    compiledContract: getCompiledContract(),
    contractAddress,
    circuitId: 'create_proposal',
    args: [proposalId, title, description],
  });

  const txId = await submitTxAsync(session.providers as any, {
    unprovenTx: callTxData.private.unprovenTx,
    circuitId: 'create_proposal',
  });

  return typeof txId === 'string' ? txId : toHex(new Uint8Array(32));
}

// Low-level deploy helper (used by a future deploy UI / script).
export async function deployContract(session: ConnectedSession): Promise<string> {
  const deployTxData = await createUnprovenDeployTx(
    { zkConfigProvider: session.providers.zkConfigProvider, walletProvider: session.providers.walletProvider },
    {
      compiledContract: getCompiledContract(),
      args: [],
      signingKey: sampleSigningKey(),
    },
  );

  const contractAddress = deployTxData.public.contractAddress;
  await submitTxAsync(session.providers as any, { unprovenTx: deployTxData.private.unprovenTx });
  return contractAddress;
}
