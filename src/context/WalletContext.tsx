import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { connectAndBuildSession, type ConnectedSession } from '../midnight-utils';

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

interface WalletContextType {
  api: any;
  session: ConnectedSession | null;
  address: string | null;
  error: string | null;
  isConnecting: boolean;
  walletType: '1am' | 'lace' | null;
  contractAddress: string;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'1am' | 'lace' | null>(null);

  const connect = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      setError('Wallet not installed. Please install the Lace or 1AM browser extension.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const sess = await connectAndBuildSession('preview');
      setWalletType((window as any).midnight?.['1am'] ? '1am' : 'lace');
      setSession(sess);
      setAddress(sess.unshieldedAddress);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'User rejected the connection or an error occurred.');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setSession(null);
    setAddress(null);
    setError(null);
    setWalletType(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        api: session?.api ?? null,
        session,
        address,
        error,
        isConnecting,
        walletType,
        contractAddress: CONTRACT_ADDRESS,
        connect,
        disconnect,
        clearError,
      }}
    >
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
