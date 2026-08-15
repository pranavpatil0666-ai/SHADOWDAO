import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useState, useEffect } from 'react';
import { getWalletBalances } from '../midnight-utils';

export default function Treasury() {
  const { session, address } = useWallet();
  const [balances, setBalances] = useState<{ unshielded: Record<string, bigint>; shielded: Record<string, bigint>; dust: { balance: bigint; cap: bigint } | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getWalletBalances(session)
      .then(setBalances)
      .catch((e) => {
        console.error(e);
        setError(e.message);
      });
  }, [session]);

  const unshieldedEntries = balances ? Object.entries(balances.unshielded) : [];
  const shieldedEntries = balances ? Object.entries(balances.shielded) : [];
  const totalUnshielded = balances ? unshieldedEntries.reduce((sum, [, v]) => sum + v, 0n) : 0n;
  const totalShielded = balances ? shieldedEntries.reduce((sum, [, v]) => sum + v, 0n) : 0n;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center border-b border-white/5">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ShadowDAO
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/proposals" className="text-gray-400 hover:text-white transition-colors">Proposals</Link>
          <Link to="/treasury" className="text-primary font-medium">Treasury</Link>
          <Link to="/governance" className="text-gray-400 hover:text-white transition-colors">Governance</Link>
          <Link to="/membership" className="text-gray-400 hover:text-white transition-colors">Membership</Link>
        </nav>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Treasury</h1>
          <p className="text-gray-400">Live wallet balances from the Midnight chain</p>
        </div>

        {!session && (
          <div className="glass-panel p-4 mb-8 border-primary/40">
            <p className="text-gray-300">
              Connect your wallet to see your live balances.{' '}
              <Link to="/connect" className="text-primary font-medium hover:underline">Connect Wallet →</Link>
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-panel p-6 border-t-4 border-t-primary">
            <h3 className="text-gray-400 text-sm font-medium">Unshielded Balance</h3>
            <p className="text-3xl font-bold mt-2">{balances ? formatToken(totalUnshielded) : '—'}</p>
            <p className="text-sm text-gray-400 mt-1">Public tNIGHT</p>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-secondary">
            <h3 className="text-gray-400 text-sm font-medium">Shielded Balance</h3>
            <p className="text-3xl font-bold mt-2">{balances ? formatToken(totalShielded) : '—'}</p>
            <p className="text-sm text-gray-400 mt-1">Private NIGHT</p>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-green-500">
            <h3 className="text-gray-400 text-sm font-medium">DUST</h3>
            <p className="text-3xl font-bold mt-2">{balances?.dust ? formatToken(balances.dust.balance) : '—'}</p>
            <p className="text-sm text-gray-400 mt-1">Sponsored fees</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Unshielded Balances</h2>
            </div>
            {!balances ? (
              <p className="text-gray-400 text-sm py-8 text-center">Connect wallet to load balances.</p>
            ) : unshieldedEntries.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No unshielded tokens.</p>
            ) : (
              <div className="space-y-4">
                {unshieldedEntries.map(([token, amount]) => (
                  <div key={token} className="flex items-center justify-between p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                        {token.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium break-all">{token}</p>
                        <p className="text-sm text-gray-400">{formatToken(amount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Shielded Balances</h2>
            </div>
            {!balances ? (
              <p className="text-gray-400 text-sm py-8 text-center">Connect wallet to load balances.</p>
            ) : shieldedEntries.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No shielded tokens.</p>
            ) : (
              <div className="space-y-4">
                {shieldedEntries.map(([token, amount]) => (
                  <div key={token} className="flex items-center justify-between p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold shrink-0">
                        {token.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium break-all">{token}</p>
                        <p className="text-sm text-gray-400">{formatToken(amount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
              <h4 className="font-medium mb-2">Wallet</h4>
              <p className="text-sm text-gray-400 font-mono break-all">{address || 'Not connected'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatToken(value: bigint): string {
  const NIGHT = 10n ** 18n;
  const whole = value / NIGHT;
  const frac = (value % NIGHT) / (NIGHT / 100n);
  if (whole === 0n && frac === 0n) return '0';
  if (whole === 0n) return `${frac.toString()} μNIGHT`;
  return `${whole.toLocaleString()}.${frac.toString().padStart(2, '0')} NIGHT`;
}
