import { useState, useCallback, useEffect } from 'react';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createConnectedSession, type ConnectedSession } from '../lib/midnight';

export const TARGET_NETWORK = 'preview';

export type WalletType = '1am' | 'lace' | null;
export type WalletStatus = 'checking' | 'detected' | 'not-found';

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

export function detectWallets(): { '1am'?: InitialAPI; lace?: InitialAPI } {
  if (typeof window === 'undefined' || !(window as any).midnight) return {};
  const m = (window as any).midnight as Record<string, InitialAPI>;
  return {
    '1am': m['1am'],
    lace: m.mnLace,
  };
}

export function useMidnight() {
  const [api, setApi] = useState<ConnectedAPI | null>(null);
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [error, setError] = useState<WalletError | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletStatus, setWalletStatus] = useState<'checking' | 'detected' | 'not-found'>('checking');
  const [availableWallets, setAvailableWallets] = useState<{ '1am'?: InitialAPI; lace?: InitialAPI }>({});

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      const wallets = detectWallets();
      if (wallets['1am'] || wallets.lace) {
        setAvailableWallets(wallets);
        setWalletType(wallets['1am'] ? '1am' : 'lace');
        setWalletStatus('detected');
        clearInterval(id);
        return;
      }
      if (Date.now() - startedAt >= 6000) {
        setWalletStatus('not-found');
        clearInterval(id);
      }
    }, 300);
    return () => clearInterval(id);
  }, []);

  const connect = useCallback(async (forceType?: WalletType) => {
    if (isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const wallets = availableWallets;
      const chosenType = forceType ?? walletType;
      const wallet = chosenType ? wallets[chosenType] : (wallets['1am'] ?? wallets.lace);

      if (!wallet) {
        throw { kind: 'no-wallet' as const, message: 'No Midnight wallet found. Please install the 1AM or Lace wallet extension and refresh.' };
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
      setWalletType(wallet.name.toLowerCase().includes('1am') ? '1am' : 'lace');
    } catch (e: any) {
      const err: WalletError = e?.kind
        ? e
        : { kind: 'unknown', message: e?.message ?? String(e) };
      console.error('Wallet connection error:', err);
      setError(err);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, walletType, availableWallets]);

  const disconnect = useCallback(() => {
    setApi(null);
    setSession(null);
    setAddress(null);
    setWalletType(null);
    setError(null);
    setWalletStatus('checking');
    setAvailableWallets({});
  }, []);

  return { api, session, address, walletType, walletStatus, availableWallets, error, isConnecting, connect, disconnect };
}