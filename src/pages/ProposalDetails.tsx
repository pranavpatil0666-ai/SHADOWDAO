import { useParams, Link } from 'react-router-dom';
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
  proposer: string;
  quorum: number;
  threshold: number;
}

const mockProposals: Record<number, Proposal> = {
  1: {
    id: 1,
    title: 'Allocate 1,000 NIGHT to Developer Grant #04',
    description: `This proposal allocates 1,000 NIGHT tokens from the ShadowDAO Treasury to fund the ongoing development of ZK primitives by Developer Grant #04.

The Developer Grant #04 has been instrumental in advancing Midnight's zero-knowledge proof infrastructure, including:
- Optimized PLONK verifier circuits
- Recursive proof composition for scaling
- Private state management improvements
- Developer tooling and documentation

This grant will enable continued research and development for the next quarter, with milestones focused on reducing proof generation time by 40% and improving the developer experience for Compact smart contract authors.`,
    status: 'Active',
    totalVotes: 42,
    yes: 28,
    no: 10,
    abstain: 4,
    createdAt: '2024-01-15',
    endsAt: '2024-02-15',
    proposer: '0x7c3a...ed12',
    quorum: 100,
    threshold: 50,
  },
  2: {
    id: 2,
    title: 'Upgrade Governance Contract to v2',
    description: `Upgrade the ShadowDAO governance contract to version 2 with improved vote delegation and quadratic voting support.

Key improvements in v2:
- Vote delegation to trusted representatives
- Quadratic voting for more equitable influence
- Improved proposal execution timing
- Enhanced privacy for vote commitments
- Gas optimization for batch operations`,
    status: 'Executed',
    totalVotes: 156,
    yes: 110,
    no: 30,
    abstain: 16,
    createdAt: '2023-12-01',
    endsAt: '2024-01-01',
    proposer: '0x06b6...d434',
    quorum: 100,
    threshold: 50,
  },
  3: {
    id: 3,
    title: 'Treasury Diversification Strategy',
    description: `Diversify 20% of treasury holdings into stablecoins to reduce volatility risk.

This proposal authorizes the treasury management committee to convert up to 20% of NIGHT holdings (approximately 250,000 NIGHT) into a basket of approved stablecoins (USDC, USDT, DAI) over a 30-day period using TWAP execution to minimize market impact.`,
    status: 'Pending',
    totalVotes: 0,
    yes: 0,
    no: 0,
    abstain: 0,
    createdAt: '2024-02-01',
    endsAt: '2024-03-01',
    proposer: '0x1234...5678',
    quorum: 100,
    threshold: 60,
  },
};

export default function ProposalDetails() {
  const { id } = useParams<{ id: string }>();
  const proposal = mockProposals[Number(id)];
  const { address } = useWallet();

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Proposal Not Found</h1>
          <Link to="/proposals" className="btn-primary inline-block">Back to Proposals</Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    Active: 'bg-green-500/20 text-green-400 border border-green-500/30',
    Executed: 'bg-gray-700/50 text-gray-300 border border-gray-600',
    Pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  };

  const quorumMet = proposal.totalVotes >= proposal.quorum;

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
        <Link to="/proposals" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Proposals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-md ${statusColors[proposal.status]}`}>
                    {proposal.status}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">#{proposal.id}</span>
                </div>
                {proposal.status === 'Active' && address && (
                  <Link to={`/vote/${proposal.id}`} className="btn-primary whitespace-nowrap">
                    Vote Privately
                  </Link>
                )}
              </div>

              <h1 className="text-3xl font-extrabold mb-4">{proposal.title}</h1>
              <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                {proposal.description}
              </div>
            </div>

            <div className="glass-panel p-8">
              <h2 className="text-xl font-bold mb-6">Voting Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Votes" value={proposal.totalVotes} icon="📊" />
                <StatCard label="Quorum" value={`${proposal.totalVotes}/${proposal.quorum}`} 
                  subLabel={quorumMet ? 'Met ✓' : 'Not Met'}
                  subColor={quorumMet ? 'text-green-400' : 'text-red-400'}
                  icon="🎯"
                />
                <StatCard label="Threshold" value={`${proposal.threshold}%`} icon="⚖️" />
              </div>

              <div className="space-y-4">
                <VoteBar label="YES" value={proposal.yes} total={proposal.totalVotes} color="green" />
                <VoteBar label="NO" value={proposal.no} total={proposal.totalVotes} color="red" />
                <VoteBar label="ABSTAIN" value={proposal.abstain} total={proposal.totalVotes} color="gray" />
              </div>

              {proposal.status === 'Executed' && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-medium">✅ This proposal has been executed on-chain.</p>
                  <p className="text-sm text-gray-400 mt-1">Execution transaction: 0xabc123...def456</p>
                </div>
              )}
            </div>

            <div className="glass-panel p-8">
              <h2 className="text-xl font-bold mb-6">Proposal Timeline</h2>
              <div className="space-y-4">
                <TimelineItem 
                  date={proposal.createdAt} 
                  title="Proposal Created" 
                  description={`Submitted by ${proposal.proposer}`}
                  active={true}
                />
                <TimelineItem 
                  date={proposal.status === 'Active' ? 'Ongoing' : proposal.endsAt} 
                  title="Voting Period" 
                  description={proposal.status === 'Active' ? 'Voting is currently open' : 'Voting period ended'}
                  active={proposal.status === 'Active'}
                />
                <TimelineItem 
                  date={proposal.endsAt} 
                  title={proposal.status === 'Executed' ? 'Executed' : proposal.status === 'Active' ? 'Execution' : 'Execution Scheduled'} 
                  description={proposal.status === 'Executed' ? 'Proposal executed on-chain' : 'If passed, proposal will be executed'}
                  active={proposal.status === 'Executed'}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Proposal Info</h3>
              <div className="space-y-4 text-sm">
                <InfoRow label="Proposer" value={proposal.proposer} />
                <InfoRow label="Created" value={proposal.createdAt} />
                <InfoRow label="Voting Ends" value={proposal.endsAt} />
                <InfoRow label="Quorum Required" value={proposal.quorum.toString()} />
                <InfoRow label="Passing Threshold" value={`${proposal.threshold}%`} />
                <InfoRow label="Status" value={proposal.status} valueClass={statusColors[proposal.status].split(' ')[0]} />
              </div>
            </div>

            {proposal.status === 'Active' && !address && (
              <div className="glass-panel p-6 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="font-bold mb-2">Connect Wallet to Vote</h3>
                <p className="text-gray-400 text-sm mb-4">You need to connect your Lace wallet to participate in voting.</p>
                <Link to="/connect" className="btn-primary inline-block">Connect Wallet</Link>
              </div>
            )}

            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">How Voting Works</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <StepItem number="1" text="Your vote choice is hashed with your membership secret locally" />
                <StepItem number="2" text="A Zero-Knowledge proof is generated proving valid vote without revealing choice" />
                <StepItem number="3" text="Proof is submitted on-chain via Lace wallet on Midnight Preview network" />
                <StepItem number="4" text="Public tally updates; your individual vote remains private forever" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, subLabel, subColor, icon }: { label: string; value: string | number; subLabel?: string; subColor?: string; icon: string }) {
  return (
    <div className="bg-[#0B0F19]/50 rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subLabel && <p className={`text-sm mt-1 ${subColor}`}>{subLabel}</p>}
    </div>
  );
}

function VoteBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colors = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-gray-400">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-3 bg-[#0B0F19] rounded-full overflow-hidden">
        <div 
          className={`${colors[color as keyof typeof colors]} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TimelineItem({ date, title, description, active }: { date: string; title: string; description: string; active: boolean }) {
  return (
    <div className="flex gap-4 relative">
      <div className="relative flex-shrink-0">
        <div className={`w-4 h-4 rounded-full border-2 ${active ? 'bg-primary border-primary' : 'bg-[#0B0F19] border-gray-600'}`} />
        {!active && (
          <div className="absolute left-1.5 top-6 bottom-0 w-0.5 bg-gray-700" />
        )}
      </div>
      <div className="flex-1 pt-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold">{title}</h4>
          <span className="text-xs text-gray-500 bg-[#0B0F19] px-2 py-0.5 rounded">{date}</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className={`font-mono text-sm ${valueClass || ''}`}>{value}</span>
    </div>
  );
}

function StepItem({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
        {number}
      </div>
      <p className="pt-1">{text}</p>
    </div>
  );
}