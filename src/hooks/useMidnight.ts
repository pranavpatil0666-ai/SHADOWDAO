import { useState, useCallback } from 'react';

// Simplified hook for connecting to Lace Wallet
export function useMidnight() {
  const [api, setApi] = useState<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      if (typeof window === 'undefined' || !(window as any).midnight?.mnLace) {
        throw new Error('Wallet not installed. Please install the Lace browser extension.');
      }
      
      const laceApi = await (window as any).midnight.mnLace.enable();
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