import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { Contract } from '../managed/contract/index.js';
import { getNetworkConfig } from './network';

export const connectWallet = async () => {
  if (typeof window === 'undefined' || !(window as any).midnight?.mnLace) {
    throw new Error('Midnight Lace wallet is not installed. Please install the Lace browser extension.');
  }

  try {
    const laceApi = await (window as any).midnight.mnLace.enable();
    const state = await laceApi.state();
    if (!state.address) {
      throw new Error('No address found in the wallet. Please create an account in Lace.');
    }
    
    return {
      api: laceApi,
      address: state.address,
    };
  } catch (error) {
    console.error('Failed to connect to Midnight Lace wallet:', error);
    throw error;
  }
};

export const createProviders = (laceApi: any) => {
  const config = getNetworkConfig();
  
  const zkConfigProvider = new FetchZkConfigProvider(window.location.origin + '/contract/shadow-dao');
  
  // Fix: httpClientProofProvider requires the zkConfigProvider as the second argument
  const proofProvider = httpClientProofProvider(config.proofServerUrl, zkConfigProvider);
  
  const publicDataProvider = indexerPublicDataProvider(config.indexerUrl, config.indexerWsUrl);
  
  const walletProvider = {
    submitTx: async (tx: any) => await laceApi.submitTransaction(tx),
  } as any;

  return {
    zkConfigProvider,
    proofProvider,
    publicDataProvider,
    walletProvider,
    midnightProvider: walletProvider,
  } as any;
};

// Helper to construct the compiled contract for the frontend
const getCompiledContract = () => {
  return CompiledContract.make('shadow_dao', Contract).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets(window.location.origin + '/contract/shadow-dao')
  ) as any;
};

export const getContractState = async (laceApi: any, contractAddress: string) => {
  const providers = createProviders(laceApi);
  
  try {
    const contract = await findDeployedContract(providers, {
      contractAddress,
      compiledContract: getCompiledContract(),
    });
    
    // Note: To fetch the actual state, we need to query the state from the provider.
    // In typical midnight dapps, you can watch state or fetch state using publicDataProvider
    // We cast contract to any to bypass any missing internal properties in this template
    return {
      total_votes: Number((contract as any).deployTxData?.public?.contractState?.data?.total_votes ?? 0)
    };
  } catch (err) {
    console.error('Error fetching contract state:', err);
    return { total_votes: 0 };
  }
};

export const submitVote = async (laceApi: any, contractAddress: string, proposalId: number, choice: number) => {
  console.log('Submitting vote to contract', contractAddress, 'choice:', choice);
  const providers = createProviders(laceApi);
  
  try {
    const contract = await findDeployedContract(providers, {
      contractAddress,
      compiledContract: getCompiledContract(),
    });

    const dummySecret = new Uint8Array(32);
    dummySecret.fill(1);
    
    // Note: `callTx` is typically used to invoke circuits in v4
    const tx = await (contract as any).callTx.vote(BigInt(proposalId), BigInt(choice), dummySecret);
    console.log('Transaction proven and submitted:', tx);
    
    return tx;
  } catch (err: any) {
    console.error('Failed to submit vote:', err);
    throw err;
  }
};
