import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';
import { Contract as ShadowDAOContract, ledger as shadowDaoLedger, type Ledger } from '../../managed/contract';

export const CONTRACT_NAME = 'shadow_dao';
type ZkConfigProvider = FetchZkConfigProvider<any>;

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

const INDEXER_LATEST_STATE_QUERY = `
  query LATEST_CONTRACT_STATE($address: HexEncoded!) {
    contractAction(address: $address) { state }
  }
`;

export function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);

  async function queryLatest(query: string, address: string) {
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables: { address } }),
    });
    if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
    const payload = await res.json();
    if (payload.errors?.length) throw new Error(payload.errors.map((e: any) => e.message).join('; '));
    return payload.data?.contractAction ?? null;
  }

  return {
    ...base,
    async queryContractState(contractAddress: string, config?: any) {
      if (config) return base.queryContractState(contractAddress, config);
      const action = await queryLatest(INDEXER_LATEST_STATE_QUERY, contractAddress);
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },
    async queryZSwapAndContractState(contractAddress: string, config?: any) {
      if (config) return base.queryZSwapAndContractState(contractAddress, config);
      const action = await queryLatest(`
        query LATEST_BOTH_STATE($address: HexEncoded!) {
          contractAction(address: $address) {
            state
            zswapState
            transaction { block { ledgerParameters } }
          }
        }`, contractAddress);
      if (!action?.zswapState) return null;
      return [
        (await import('@midnight-ntwrk/midnight-js-protocol/ledger')).ZswapChainState.deserialize(fromHex(action.zswapState)),
        ContractState.deserialize(fromHex(action.state)),
        action.transaction?.block?.ledgerParameters
          ? (await import('@midnight-ntwrk/midnight-js-protocol/ledger')).LedgerParameters.deserialize(fromHex(action.transaction.block.ledgerParameters))
          : (await import('@midnight-ntwrk/midnight-js-protocol/ledger')).LedgerParameters.initialParameters(),
      ];
    },
  };
}

export interface ConnectedSession {
  api: any;
  config: any;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>;
    zkConfigProvider: ZkConfigProvider;
    proofProvider: { proveTx: (unprovenTx: any, _config: any) => Promise<any> };
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
  unshieldedAddress: string;
}

export async function createConnectedSession(api: any): Promise<ConnectedSession> {
  const [config, unshieldedAddress, shieldedAddresses] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/contract/shadow-dao', window.location.origin).toString(),
    window.fetch.bind(window),
  ) as ZkConfigProvider;

  const provingProvider = await api.getProvingProvider(zkConfigProvider);

  const proofProvider = {
    async proveTx(unprovenTx: any, _config: any) {
      const { CostModel } = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      if (!balanced?.tx) throw new Error('balanceUnsealedTransaction returned invalid result.');
      const { Transaction } = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      await api.submitTransaction(txHex);
      return txHex.slice(0, 64);
    },
  };

  return {
    api,
    config,
    providers: {
      privateStateProvider: createPrivateStateProvider(),
      publicDataProvider: createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
    unshieldedAddress: unshieldedAddress.unshieldedAddress,
  };
}

let compiledContractPromise: Promise<any> | null = null;

export function getCompiledContract() {
  if (!compiledContractPromise) {
    compiledContractPromise = Promise.resolve(
      CompiledContract.make(CONTRACT_NAME, ShadowDAOContract).pipe(
        CompiledContract.withVacantWitnesses,
        CompiledContract.withCompiledFileAssets('/contract/shadow-dao'),
      ),
    );
  }
  return compiledContractPromise;
}

export async function readVotes(
  session: ConnectedSession,
  contractAddress: string,
): Promise<bigint> {
  const contractState = await session.providers.publicDataProvider.queryContractState(contractAddress);
  if (!contractState?.data) return 0n;
  const ledgerState: Ledger = shadowDaoLedger(contractState.data);
  return ledgerState.total_votes;
}

export interface VoteResult {
  txId: string;
  votes: bigint;
}

export async function callVote(
  session: ConnectedSession,
  contractAddress: string,
  proposalId: bigint,
  choice: bigint,
  memberSecret: Uint8Array,
): Promise<VoteResult> {
  const compiledContract = await getCompiledContract();

  const callTxData = await createUnprovenCallTx(session.providers as any, {
    compiledContract,
    contractAddress,
    circuitId: 'vote',
    args: [proposalId, choice, memberSecret],
  });

  const txId = await submitTxAsync(session.providers as any, {
    unprovenTx: callTxData.private.unprovenTx,
    circuitId: 'vote',
  });

  return { txId, votes: await readVotes(session, contractAddress) };
}