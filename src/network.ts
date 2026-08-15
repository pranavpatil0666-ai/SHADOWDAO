// ShadowDAO Network Configuration for Midnight Preview
export const getNetworkConfig = () => {
  return {
    networkId: 'preview',
    indexerUrl: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWsUrl: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    nodeUrl: 'https://rpc.preview.midnight.network',
    proofServerUrl: 'http://127.0.0.1:6300'
  };
};
