import { useState, useCallback } from 'react';

// Simplified hook for connecting to Lace Wallet
export function useMidnight() {
  const [api, setApi] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const midnight = (window as any).midnight;
      if (!midnight) {
        throw new Error('No Midnight wallet detected. Please install Lace or 1am Wallet.');
      }
      
      const walletProvider = midnight['1am'] || midnight.mn1am || midnight.mnLace;
      
      if (!walletProvider) {
        throw new Error('Supported Midnight wallet not found. Please install Lace or 1am Wallet.');
      }
      
      const laceApi = await walletProvider.enable();
      const state = await laceApi.state();
      
      if (!state.address) {
        throw new Error('No address found in the connected wallet.');
      }
      
      setApi(laceApi);
      setAddress(state.address);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'User rejected the connection or an error occurred.');
    }
  }, []);

  const disconnect = useCallback(() => {
    setApi(null);
    setAddress(null);
    setError(null);
  }, []);

  return { api, address, error, connect, disconnect };
}