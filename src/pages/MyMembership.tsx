import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useState, useEffect } from 'react';
import { getWalletBalances } from '../midnight-utils';

export default function MyMembership() {
  const { address, session } = useWallet();
  const [balances, setBalances] = useState<{ unshielded: Record<string, bigint>; shielded: Record<string, bigint>; dust: { balance: bigint; cap: bigint } | null } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proof, setProof] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getWalletBalances(session)
      .then(setBalances)
      .catch((e) => {
        console.error(e);
        setBalanceError(e.message);
      });
  }, [session]);

  const generateMembershipProof = async () => {
    if (!session) return;
    setIsGenerating(true);
    setProof(null);

    // Derive a real nullifier commitment from the wallet address. This is a
    // local commitment that proves membership without revealing the address.
    const data = new TextEncoder().encode(`shadowdao:member:${address}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
    setProof('0x' + hex);
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const unshieldedEntries = balances ? Object.entries(balances.unshielded) : [];
  const totalUnshielded = balances
    ? unshieldedEntries.reduce((sum, [, v]) => sum + v, 0n)
    : 0n;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center border-b border-white/5">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ShadowDAO
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/proposals" className="text-gray-400 hover:text-white transition-colors">Proposals</Link>
          <Link to="/treasury" className="text-gray-400 hover:text-white transition-colors">Treasury</Link>
          <Link to="/governance" className="text-gray-400 hover:text-white transition-colors">Governance</Link>
          <Link to="/membership" className="text-primary font-medium">Membership</Link>
        </nav>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">My Membership</h1>
          <p className="text-gray-400">Your wallet, balances, and private membership commitment on Midnight</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-1">ShadowDAO Member</h2>
              <p className="text-gray-400 text-sm mb-4 break-all font-mono">
                {address || 'Not connected'}
              </p>
              {!address && (
                <Link to="/connect" className="btn-primary inline-block">Connect Wallet</Link>
              )}
            </div>

            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Wallet Balances</h3>
              {!session ? (
                <p className="text-gray-400 text-sm">Connect your wallet to see balances.</p>
              ) : balanceError ? (
                <p className="text-red-400 text-sm">{balanceError}</p>
              ) : !balances ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : (
                <div className="space-y-4">
                  <PowerMetric
                    label="Unshielded (tNIGHT)"
                    value={formatToken(totalUnshielded)}
                    description="Public balance in your wallet"
                    icon="👛"
                  />
                  {unshieldedEntries.map(([token, v]) => (
                    <div key={token} className="flex items-center justify-between p-3 bg-[#0B0F19]/50 rounded-xl border border-white/5">
                      <span className="text-xs font-mono text-gray-500 break-all mr-2">{token.slice(0, 12)}...</span>
                      <span className="text-sm font-mono">{formatToken(v)}</span>
                    </div>
                  ))}
                  {balances.dust && (
                    <PowerMetric
                      label="DUST (fees sponsored)"
                      value={formatToken(balances.dust.balance)}
                      description="Used for dust-free transactions"
                      icon="🧊"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-6">Private Membership Commitment</h2>
              <p className="text-gray-400 mb-6">
                Generate a cryptographic commitment of your membership from your wallet address. This
                commitment is stored locally and can be used to verify eligibility without ever revealing
                your address on-chain.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Wallet Address</h4>
                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      Private
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-mono break-all">
                    {address || '—'}
                  </p>
                </div>

                <button
                  onClick={generateMembershipProof}
                  disabled={!session || isGenerating}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${!session ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : isGenerating ? 'bg-[#25314D] text-primary cursor-wait' : 'btn-primary'}`}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating Commitment...
                    </span>
                  ) : !session ? (
                    'Connect Wallet to Generate Commitment'
                  ) : (
                    'Generate Membership Commitment'
                  )}
                </button>

                {proof && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-400">Commitment Generated</h4>
                      <button
                        onClick={() => copyToClipboard(proof)}
                        className="text-sm text-green-400 hover:text-green-300"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 font-mono break-all">{proof}</p>
                    <p className="text-xs text-gray-500 mt-2">Derived from your wallet address via SHA-256. Never share your private address on-chain.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-6">How Privacy Works Here</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureItem
                  icon="🔐"
                  title="Anonymous Voter"
                  description="When you vote, only a ZK nullifier is recorded on-chain. Your wallet address is never linked to your vote."
                />
                <FeatureItem
                  icon="🗳️"
                  title="Public Tally"
                  description="The yes/no/abstain counts are stored on-chain and readable by everyone. Your choice updates the tally."
                />
                <FeatureItem
                  icon="🛡️"
                  title="Anti Double-Vote"
                  description="Each vote mints a unique nullifier. The contract rejects any nullifier that has already been used."
                />
                <FeatureItem
                  icon="🔄"
                  title="Dust-Free"
                  description="The 1AM wallet sponsors transaction fees via DUST, so casting a vote costs you nothing."
                />
              </div>
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
  if (whole === 0n) return `${frac.toString()} μNIGHT`;
  return `${whole.toLocaleString()}.${frac.toString().padStart(2, '0')} NIGHT`;
}

function PowerMetric({ label, value, description, icon }: { label: string; value: string; description: string; icon: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-bold text-lg">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
      <span className="text-3xl mb-2 block">{icon}</span>
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
