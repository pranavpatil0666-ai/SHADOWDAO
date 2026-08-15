import { Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useWallet } from '../context/WalletContext';
import { useProposals } from '../hooks/useProposals';

export default function Proposals() {
  const { session } = useWallet();
  const { proposals, isLoading, error, refresh } = useProposals();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('status');
  const [filter, setFilter] = useState<'all' | 'active' | 'executed' | 'pending'>(
    initialFilter === 'active' || initialFilter === 'executed' || initialFilter === 'pending' ? initialFilter : 'all'
  );
  const [search, setSearch] = useState('');

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchesFilter = filter === 'all' || p.status.toLowerCase() === filter;
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, proposals]);

  const statusTabs = [
    { value: 'all', label: 'All', count: proposals.length },
    { value: 'active', label: 'Active', count: proposals.filter(p => p.status === 'Active').length },
    { value: 'executed', label: 'Executed', count: 0 },
    { value: 'pending', label: 'Pending', count: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center border-b border-white/5">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ShadowDAO
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/proposals" className="text-primary font-medium">Proposals</Link>
          <Link to="/treasury" className="text-gray-400 hover:text-white transition-colors">Treasury</Link>
          <Link to="/governance" className="text-gray-400 hover:text-white transition-colors">Governance</Link>
          <Link to="/membership" className="text-gray-400 hover:text-white transition-colors">Membership</Link>
        </nav>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Proposals</h1>
            <p className="text-gray-400">Live on-chain proposals from the ShadowDAO Compact contract</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refresh}
              className="btn-secondary"
            >
              Refresh
            </button>
            {session && (
              <Link to="/create-proposal" className="btn-primary">
                Create Proposal
              </Link>
            )}
          </div>
        </div>

        {!session && (
          <div className="glass-panel p-4 mb-8 border-primary/40">
            <p className="text-gray-300">
              Connect your wallet to read and vote on live proposals.{' '}
              <Link to="/connect" className="text-primary font-medium hover:underline">Connect Wallet →</Link>
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="glass-panel p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">Search proposals</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as 'all' | 'active' | 'executed' | 'pending')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === tab.value
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                      : 'bg-[#25314D] text-gray-300 border border-white/10 hover:border-primary'
                  }`}
                >
                  {tab.label} <span className="ml-2 text-xs opacity-70">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading && proposals.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-bold mb-2">Fetching live proposals...</h3>
              <p className="text-gray-400">Reading on-chain state from the Midnight indexer.</p>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">No proposals found</h3>
              <p className="text-gray-400">The contract has no proposals yet, or try adjusting your filters.</p>
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <Link key={proposal.id.toString()} to={`/proposals/${proposal.id}`} className="block">
                <ProposalCard proposal={proposal} />
              </Link>
            ))
          )}
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>Showing {filteredProposals.length} live on-chain proposal{filteredProposals.length === 1 ? '' : 's'}</p>
        </div>
      </main>
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: { id: bigint; title: string; description: string; totalVotes: number; yes: bigint; no: bigint; abstain: bigint } }) {
  return (
    <div className="glass-panel p-6 hover:border-primary/50 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block mr-1.5" />
              Active
            </span>
            <span className="text-gray-400 text-sm">#{proposal.id.toString()}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
          <p className="text-gray-400 line-clamp-2 mb-3">{proposal.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>Yes: {proposal.yes.toString()}</span>
            <span>•</span>
            <span>No: {proposal.no.toString()}</span>
            <span>•</span>
            <span>Abstain: {proposal.abstain.toString()}</span>
            <span>•</span>
            <span>Total votes: {proposal.totalVotes}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:ml-8 shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
