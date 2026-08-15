import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useProposals } from '../hooks/useProposals';

export default function DAODashboard() {
  const { address, session, contractAddress } = useWallet();
  const { proposals, totalVotes, isLoading, error } = useProposals();

  const stats = [
    { label: 'Total Votes Cast', value: totalVotes.toLocaleString(), icon: '🗳️', color: 'border-yellow-500' },
    { label: 'Active Proposals', value: proposals.length.toString(), icon: '📋', color: 'border-green-500' },
    { label: 'Live On-Chain Data', value: 'Midnight', icon: '⚡', color: 'border-primary' },
    { label: 'Network', value: 'Preview', icon: '🌐', color: 'border-secondary' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center border-b border-white/5">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ShadowDAO
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-primary font-medium">Dashboard</Link>
          <Link to="/proposals" className="text-gray-400 hover:text-white transition-colors">Proposals</Link>
          <Link to="/treasury" className="text-gray-400 hover:text-white transition-colors">Treasury</Link>
          <Link to="/governance" className="text-gray-400 hover:text-white transition-colors">Governance</Link>
          <Link to="/membership" className="text-gray-400 hover:text-white transition-colors">Membership</Link>
        </nav>
        <div className="flex items-center gap-4">
          {address && (
            <span className="text-sm text-gray-400 font-mono hidden sm:block">
              {address.slice(0, 8)}...{address.slice(-6)}
            </span>
          )}
          {!session && (
            <Link to="/connect" className="btn-primary text-sm">Connect Wallet</Link>
          )}
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">DAO Dashboard</h1>
          <p className="text-gray-400">
            Live state from contract {contractAddress ? `${contractAddress.slice(0, 10)}...` : '(not configured)'}
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel p-6 border-l-4" style={{ borderColor: stat.color.replace('border-', '') }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <p className="text-2xl font-bold">{isLoading && !totalVotes && !proposals.length ? '…' : stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Active Proposals</h2>
              <Link to="/proposals" className="text-primary text-sm font-medium hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {isLoading && proposals.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Loading live proposals...</p>
              ) : proposals.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No proposals on-chain yet.</p>
              ) : (
                proposals.map((proposal) => (
                  <ProposalCard key={proposal.id.toString()} proposal={proposal} />
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/proposals" className="btn-secondary w-full justify-center block">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Browse Proposals
                </Link>
                <Link to="/treasury" className="btn-secondary w-full justify-center flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Treasury
                </Link>
                {session && (
                  <Link to="/create-proposal" className="btn-primary w-full justify-center flex items-center mt-3">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Proposal
                  </Link>
                )}
                {!session && (
                  <Link to="/connect" className="btn-primary w-full justify-center block">
                    Connect Wallet
                  </Link>
                )}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-4">Network</h2>
              <div className="space-y-3 text-sm">
                <p className="text-gray-400">Contract on Midnight Preview</p>
                <p className="text-gray-500 font-mono text-xs break-all">{contractAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: { id: bigint; title: string; description: string; totalVotes: number; yes: bigint; no: bigint; abstain: bigint } }) {
  return (
    <Link to={`/proposals/${proposal.id}`} className="block">
      <div className="p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5 hover:border-primary/50 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 text-xs font-semibold rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
                Active
              </span>
              <span className="text-gray-400 text-sm">#{proposal.id.toString()}</span>
            </div>
            <h3 className="text-lg font-semibold truncate">{proposal.title}</h3>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Yes: {proposal.yes.toString()}</span>
              <span>•</span>
              <span>No: {proposal.no.toString()}</span>
              <span>•</span>
              <span>Abstain: {proposal.abstain.toString()}</span>
              <span>•</span>
              <span>Total: {proposal.totalVotes}</span>
            </div>
          </div>
          <span className="btn-primary whitespace-nowrap shrink-0">Vote Privately</span>
        </div>
      </div>
    </Link>
  );
}
