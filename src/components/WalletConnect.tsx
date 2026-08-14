import { Shield, Smartphone } from 'lucide-react';
import type { WalletError, WalletType, WalletStatus } from '../hooks/useMidnight';

interface WalletConnectProps {
  address: string | null;
  walletType: WalletType;
  walletStatus: WalletStatus;
  availableWallets: { '1am'?: any; lace?: any };
  error: WalletError | null;
  isConnecting: boolean;
  onConnect: (type?: WalletType) => void;
  onDisconnect: () => void;
}

export default function WalletConnect({
  address,
  walletType,
  walletStatus,
  availableWallets,
  error,
  isConnecting,
  onConnect,
  onDisconnect,
}: WalletConnectProps) {
  const has1am = !!availableWallets['1am'];
  const hasLace = !!availableWallets.lace;
  const multipleWallets = has1am && hasLace;

  if (walletStatus === 'checking')
    return (
      <div className="p-6 bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 mb-8 max-w-xl w-full">
        <span className="text-zinc-600 text-[11px] font-mono animate-pulse">Checking wallet...</span>
      </div>
    );

  if (address)
    return (
      <div className="p-6 bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 mb-8 max-w-xl w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {walletType === 'lace' ? (
            <Smartphone className="w-5 h-5 text-violet-400" />
          ) : (
            <Shield className="w-5 h-5 text-violet-400" />
          )}
          <div>
            <span className="text-[9px] tracking-[0.2em] font-mono text-zinc-600 uppercase block">
              {walletType === '1am' ? '1AM' : 'Lace'}
            </span>
            <span className="text-[11px] font-mono text-zinc-300 truncate max-w-[130px] block">{address}</span>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          title="Disconnect"
          className="text-zinc-600 hover:text-red-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );

  return (
    <div className="p-6 bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 mb-8 max-w-xl w-full">
      <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>

      {error && (
        <div className="p-3 mb-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
          {error.message}
        </div>
      )}

      {multipleWallets ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Multiple wallets detected — choose one:</p>
          <button
            onClick={() => onConnect('1am')}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-mono tracking-widest uppercase py-3 px-5 transition-all disabled:opacity-40"
          >
            <Shield className="w-4 h-4" />
            <span>Connect 1AM Wallet (dust-free)</span>
          </button>
          <button
            onClick={() => onConnect('lace')}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-[11px] font-mono tracking-widest uppercase py-3 px-5 transition-all disabled:opacity-40"
          >
            <Smartphone className="w-4 h-4" />
            <span>Connect Lace Wallet</span>
          </button>
        </div>
      ) : has1am ? (
        <button
          onClick={() => onConnect('1am')}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-mono tracking-widest uppercase py-3 px-5 transition-all disabled:opacity-40"
        >
          {isConnecting ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
          ) : (
            <Shield className="w-4 h-4" />
          )}
          {isConnecting ? 'Connecting...' : 'Connect 1AM Wallet (dust-free)'}
        </button>
      ) : hasLace ? (
        <button
          onClick={() => onConnect('lace')}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-[11px] font-mono tracking-widest uppercase py-3 px-5 transition-all disabled:opacity-40"
        >
          {isConnecting ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
          {isConnecting ? 'Connecting...' : 'Connect Lace Wallet'}
        </button>
      ) : (
        <p className="text-center text-[10px] font-mono text-zinc-600 py-4">
          Install 1AM or Lace wallet extension to connect
        </p>
      )}

      {!address && !error && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Your vote choice stays private — only a Zero-Knowledge proof is produced locally.
        </p>
      )}
    </div>
  );
}