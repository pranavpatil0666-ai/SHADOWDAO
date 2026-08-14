import { useState, useCallback } from 'react';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createConnectedSession, type ConnectedSession } from '../lib/midnight';

export const TARGET_NETWORK = 'preview';

export type WalletErrorKind =
  | 'no-wallet'
  | 'user-rejected'
  | 'network-mismatch'
  | 'connect-failed'
  | 'unknown';

export interface WalletError {
  kind: WalletErrorKind;
  message: string;
}

export function listWallets(): InitialAPI[] {
  if (typeof window === 'undefined' || !(window as any).midnight) return [];
  return Object.values((window as any).midnight as Record<string, InitialAPI>);
}

export function pickWallet(): InitialAPI | null {
  const wallets = listWallets();
  if (wallets.length === 0) return null;
  return (
    wallets.find((w) => w.name.toLowerCase().includes('lace')) ??
    wallets.find((w) => w.name.toLowerCase().includes('1am')) ??
    wallets[0]
  );
}

export function useMidnight() {
  const [api, setApi] = useState<ConnectedAPI | null>(null);
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [error, setError] = useState<WalletError | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const wallet = pickWallet();
      if (!wallet) {
        throw { kind: 'no-wallet' as const, message: 'No Midnight wallet found. Please install the Lace wallet extension and refresh.' };
      }

      let connectedApi: ConnectedAPI;
      try {
        connectedApi = await wallet.connect(TARGET_NETWORK);
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (/reject|denied|declined|refused|user cancelled/i.test(msg)) {
          throw { kind: 'user-rejected' as const, message: 'Connection rejected. Approve the connection request in your wallet to continue.' };
        }
        if (/network/i.test(msg)) {
          throw { kind: 'network-mismatch' as const, message: `Network mismatch. Switch your wallet to Midnight ${TARGET_NETWORK} and try again.` };
        }
        throw { kind: 'connect-failed' as const, message: msg || 'The wallet connection request failed.' };
      }

      const config = await connectedApi.getConfiguration();

      if (config.networkId !== TARGET_NETWORK) {
        throw {
          kind: 'network-mismatch' as const,
          message: `Network mismatch: your wallet is connected to "${config.networkId}", but this dApp requires "${TARGET_NETWORK}". Switch networks in your wallet.`,
        };
      }

      const connectedSession = await createConnectedSession(connectedApi);

      setApi(connectedApi);
      setSession(connectedSession);
      setAddress(connectedSession.unshieldedAddress);
      setWalletName(wallet.name);
    } catch (e: any) {
      const err: WalletError = e?.kind
        ? e
        : { kind: 'unknown', message: e?.message ?? String(e) };
      console.error('Wallet connection error:', err);
      setError(err);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    setApi(null);
    setSession(null);
    setAddress(null);
    setWalletName(null);
    setError(null);
  }, []);

  return { api, session, address, walletName, error, isConnecting, connect, disconnect };
}