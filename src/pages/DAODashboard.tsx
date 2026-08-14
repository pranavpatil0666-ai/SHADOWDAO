import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

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
];

export default function DAODashboard() {
  const { address } = useWallet();

  const stats = [
    { label: 'Treasury Balance', value: '1,250,000 NIGHT', icon: '💰', color: 'border-yellow-500' },
    { label: 'Active Proposals', value: mockProposals.filter(p => p.status === 'Active').length.toString(), icon: '📋', color: 'border-green-500' },
    { label: 'My Voting Power', value: '1,500 REP', icon: '⚡', color: 'border-primary' },
    { label: 'Total Members', value: '2,847', icon: '👥', color: 'border-secondary' },
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
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">DAO Dashboard</h1>
          <p className="text-gray-400">Overview of ShadowDAO governance and treasury</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel p-6 border-l-4" style={{ borderColor: stat.color.replace('border-', '') }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
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
              {mockProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/create-proposal" className="btn-primary w-full justify-center block">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Proposal
                </Link>
                <Link to="/proposals" className="btn-secondary w-full justify-center block">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Browse Proposals
                </Link>
                <Link to="/treasury" className="btn-secondary w-full justify-center block">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Treasury
                </Link>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-3 text-sm">
                <ActivityItem time="2 min ago" action="Proposal #1 received 5 new votes" type="vote" />
                <ActivityItem time="15 min ago" action="New proposal created: Treasury Diversification" type="create" />
                <ActivityItem time="1 hour ago" action="Proposal #2 executed successfully" type="execute" />
                <ActivityItem time="3 hours ago" action="Member 0x1234...5678 joined" type="join" />
              </div>
            </div>
          </div>
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

  return (
    <Link to={`/proposals/${proposal.id}`} className="block">
      <div className="p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5 hover:border-primary/50 transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 text-xs font-semibold rounded-md ${statusColors[proposal.status]}`}>
                {proposal.status}
              </span>
              <span className="text-gray-400 text-sm">#{proposal.id}</span>
            </div>
            <h3 className="text-lg font-semibold truncate">{proposal.title}</h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{proposal.description}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Ends: {proposal.endsAt}</span>
              <span>•</span>
              <span>Total votes: {proposal.totalVotes}</span>
            </div>
          </div>
          {proposal.status === 'Active' && (
            <span className="btn-primary whitespace-nowrap shrink-0">Vote Privately</span>
          )}
        </div>
        {proposal.status === 'Executed' && (
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-6 text-sm font-medium">
            <div className="text-green-400">Yes: {proposal.yes}</div>
            <div className="text-red-400">No: {proposal.no}</div>
            <div className="text-gray-400">Abstain: {proposal.abstain}</div>
          </div>
        )}
      </div>
    </Link>
  );
}

function ActivityItem({ time, action, type }: { time: string; action: string; type: string }) {
  const icons = {
    vote: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    create: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    execute: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    join: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  };

  return (
    <div className="flex items-center gap-3 text-gray-400">
      <div className="w-8 h-8 rounded-full bg-[#0B0F19] flex items-center justify-center text-primary">
        {icons[type as keyof typeof icons] || icons.vote}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{action}</p>
        <p className="text-xs text-gray-600">{time}</p>
      </div>
    </div>
  );
}