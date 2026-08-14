import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useState } from 'react';

export default function MyMembership() {
  const { api } = useWallet();
  const [isGenerating, setIsGenerating] = useState(false);
  const [proof, setProof] = useState<string | null>(null);

  const membershipData = {
    memberSince: '2024-01-15',
    votingPower: '1,500 REP',
    proposalsVoted: 12,
    proposalsCreated: 2,
    reputation: 'Trusted Member',
    nftBalance: 3,
  };

  const generateMembershipProof = async () => {
    if (!api) return;
    setIsGenerating(true);
    setProof(null);
    
    // Simulate ZK proof generation
    await new Promise(r => setTimeout(r, 3000));
    
    setProof('0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
          <p className="text-gray-400">Your identity, reputation, and voting power in ShadowDAO</p>
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
              <p className="text-gray-400 text-sm mb-4">Member since {membershipData.memberSince}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium border border-yellow-500/30">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                {membershipData.reputation}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Voting Power</h3>
              <div className="space-y-4">
                <PowerMetric 
                  label="Reputation (REP)" 
                  value={membershipData.votingPower} 
                  description="Earned through participation"
                  icon="⚡"
                />
                <PowerMetric 
                  label="Proposals Voted" 
                  value={membershipData.proposalsVoted.toString()} 
                  description="Your participation count"
                  icon="🗳️"
                />
                <PowerMetric 
                  label="Proposals Created" 
                  value={membershipData.proposalsCreated.toString()} 
                  description="Governance initiatives"
                  icon="📝"
                />
                <PowerMetric 
                  label="Membership NFTs" 
                  value={membershipData.nftBalance.toString()} 
                  description="Proof of membership"
                  icon="🎫"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-6">Zero-Knowledge Membership Proof</h2>
              <p className="text-gray-400 mb-6">
                Generate a cryptographic proof of your membership without revealing your identity or wallet address.
                This proof can be used to verify your eligibility for voting, accessing gated content, or participating
                in other DAO activities while maintaining complete privacy.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Membership Commitment</h4>
                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      Valid
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-mono break-all">
                    0x7c3aed12...b6d456789abcdef
                  </p>
                </div>

                <div className="p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Nullifier (Prevents Double Voting)</h4>
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-700/50 text-gray-300 border border-gray-600">
                      Private
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-mono break-all">
                    0x06b6d434...aed7c3aedb6d456
                  </p>
                </div>

                <button
                  onClick={generateMembershipProof}
                  disabled={!api || isGenerating}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${!api ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : isGenerating ? 'bg-[#25314D] text-primary cursor-wait' : 'btn-primary'}`}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating ZK Proof...
                    </span>
                  ) : !api ? (
                    'Connect Wallet to Generate Proof'
                  ) : (
                    'Generate Membership Proof'
                  )}
                </button>

                {proof && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-400">Proof Generated Successfully</h4>
                      <button
                        onClick={() => copyToClipboard(proof)}
                        className="text-sm text-green-400 hover:text-green-300"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 font-mono break-all">{proof}</p>
                    <p className="text-xs text-gray-500 mt-2">This proof verifies membership without revealing identity. Valid for 1 hour.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-6">How Membership Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureItem
                  icon="🔐"
                  title="Private Identity"
                  description="Your wallet address is never linked to your membership on-chain. Only ZK commitments are stored."
                />
                <FeatureItem
                  icon="🗝️"
                  title="Membership Secret"
                  description="A unique secret generated when you join. Combined with your vote to create nullifiers preventing double-voting."
                />
                <FeatureItem
                  icon="⚖️"
                  title="Reputation Score"
                  description="Earn REP by voting, creating proposals, and participating. Higher REP = more voting weight in quadratic voting."
                />
                <FeatureItem
                  icon="🎫"
                  title="Membership NFTs"
                  description="Soulbound NFTs representing your membership tier. Non-transferable, earned through contribution."
                />
                <FeatureItem
                  icon="🛡️"
                  title="Slashing Protection"
                  description="Malicious behavior can result in reputation slashing, but your identity remains private throughout."
                />
                <FeatureItem
                  icon="🔄"
                  title="Delegation Ready"
                  description="Delegate your voting power to trusted representatives while keeping your membership private."
                />
              </div>
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-6">Your Activity</h2>
              <div className="space-y-3">
                <ActivityRow date="2024-01-20" action="Voted on Proposal #1" details="YES • Private vote" type="vote" />
                <ActivityRow date="2024-01-18" action="Voted on Proposal #4" details="ABSTAIN • Private vote" type="vote" />
                <ActivityRow date="2024-01-15" action="Joined ShadowDAO" details="Membership NFT minted" type="join" />
                <ActivityRow date="2024-01-10" action="Created Proposal #3" details="Treasury Diversification" type="create" />
                <ActivityRow date="2024-01-05" action="Claimed Rewards" details="500 REP earned" type="reward" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
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

function ActivityRow({ date, action, details, type }: { date: string; action: string; details: string; type: string }) {
  const icons = {
    vote: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    create: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    join: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
    reward: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  };

  const colors = {
    vote: 'text-primary',
    create: 'text-secondary',
    join: 'text-green-400',
    reward: 'text-yellow-500',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
      <div className={`w-10 h-10 rounded-full bg-[#0B0F19] flex items-center justify-center ${colors[type as keyof typeof colors] || 'text-gray-400'}`}>
        {icons[type as keyof typeof icons] || icons.vote}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{action}</p>
        <p className="text-sm text-gray-400 truncate">{details}</p>
      </div>
      <p className="text-sm text-gray-500 font-mono">{date}</p>
    </div>
  );
}