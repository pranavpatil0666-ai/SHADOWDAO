import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';

interface WalletContextType {
  api: WalletConnectedAPI | null;
  address: string | null;
  error: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<WalletConnectedAPI | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).midnight?.mnLace) {
      setError('Wallet not installed. Please install the Lace browser extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
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
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setApi(null);
    setAddress(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <WalletContext.Provider value={{ api, address, error, isConnecting, connect, disconnect, clearError }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}