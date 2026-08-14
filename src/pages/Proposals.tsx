import { Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Executed' | 'Pending';
  totalVotes: number;
  yes: number;
  no: number;
  abstain: number;
  createdAt: string;
  endsAt: string;
}

const mockProposals: Proposal[] = [
  {
    id: 1,
    title: 'Allocate 1,000 NIGHT to Developer Grant #04',
    description: 'This proposal allocates 1,000 NIGHT tokens from the ShadowDAO Treasury to fund the ongoing development of ZK primitives by Developer Grant #04.',
    status: 'Active',
    totalVotes: 42,
    yes: 28,
    no: 10,
    abstain: 4,
    createdAt: '2024-01-15',
    endsAt: '2024-02-15',
  },
  {
    id: 2,
    title: 'Upgrade Governance Contract to v2',
    description: 'Upgrade the ShadowDAO governance contract to version 2 with improved vote delegation and quadratic voting support.',
    status: 'Executed',
    totalVotes: 156,
    yes: 110,
    no: 30,
    abstain: 16,
    createdAt: '2023-12-01',
    endsAt: '2024-01-01',
  },
  {
    id: 3,
    title: 'Treasury Diversification Strategy',
    description: 'Diversify 20% of treasury holdings into stablecoins to reduce volatility risk.',
    status: 'Pending',
    totalVotes: 0,
    yes: 0,
    no: 0,
    abstain: 0,
    createdAt: '2024-02-01',
    endsAt: '2024-03-01',
  },
  {
    id: 4,
    title: 'Community Grants Program Expansion',
    description: 'Expand the community grants program to include more categories and increase the total budget to 5,000 NIGHT.',
    status: 'Active',
    totalVotes: 23,
    yes: 18,
    no: 3,
    abstain: 2,
    createdAt: '2024-01-20',
    endsAt: '2024-02-20',
  },
  {
    id: 5,
    title: 'Emergency Bug Bounty Fund',
    description: 'Establish a 500 NIGHT emergency bug bounty fund for critical vulnerability disclosures.',
    status: 'Executed',
    totalVotes: 89,
    yes: 72,
    no: 12,
    abstain: 5,
    createdAt: '2023-11-15',
    endsAt: '2023-12-15',
  },
];

export default function Proposals() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('status');
  const [filter, setFilter] = useState<'all' | 'active' | 'executed' | 'pending'>(
    initialFilter === 'active' || initialFilter === 'executed' || initialFilter === 'pending' ? initialFilter : 'all'
  );
  const [search, setSearch] = useState('');

  const filteredProposals = useMemo(() => {
    return mockProposals.filter((p) => {
      const matchesFilter = filter === 'all' || p.status.toLowerCase() === filter;
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const statusTabs = [
    { value: 'all', label: 'All', count: mockProposals.length },
    { value: 'active', label: 'Active', count: mockProposals.filter(p => p.status === 'Active').length },
    { value: 'executed', label: 'Executed', count: mockProposals.filter(p => p.status === 'Executed').length },
    { value: 'pending', label: 'Pending', count: mockProposals.filter(p => p.status === 'Pending').length },
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
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Proposals</h1>
          <p className="text-gray-400">Browse and participate in DAO governance proposals</p>
        </div>

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
          {filteredProposals.length === 0 ? (
            <div className="glass-panel p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">No proposals found</h3>
              <p className="text-gray-400">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <Link key={proposal.id} to={`/proposals/${proposal.id}`} className="block">
                <ProposalCard proposal={proposal} />
              </Link>
            ))
          )}
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>Showing {filteredProposals.length} of {mockProposals.length} proposals</p>
        </div>
      </main>
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const statusColors = {
    Active: 'bg-green-500/20 text-green-400 border border-green-500/30',
    Executed: 'bg-gray-700/50 text-gray-300 border border-gray-600',
    Pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  };

  const statusIcons = {
    Active: <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />,
    Executed: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    Pending: <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>,
  };

  return (
    <div className="glass-panel p-6 hover:border-primary/50 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-md ${statusColors[proposal.status]}`}>
              {statusIcons[proposal.status]}
              {proposal.status}
            </span>
            <span className="text-gray-400 text-sm">#{proposal.id}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
          <p className="text-gray-400 line-clamp-2 mb-3">{proposal.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>Created: {proposal.createdAt}</span>
            <span>•</span>
            <span>Ends: {proposal.endsAt}</span>
            <span>•</span>
            <span>Total votes: {proposal.totalVotes}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:ml-8 shrink-0">
          {proposal.status === 'Executed' && (
            <div className="flex gap-6 text-sm font-medium hidden sm:flex">
              <div className="text-green-400">Yes: {proposal.yes}</div>
              <div className="text-red-400">No: {proposal.no}</div>
              <div className="text-gray-400">Abstain: {proposal.abstain}</div>
            </div>
          )}
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