import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getProposals, type ProposalLedger } from '../midnight-utils';

export default function ProposalDetails() {
  const { id } = useParams<{ id: string }>();
  const { session, contractAddress, address } = useWallet();
  const [proposal, setProposal] = useState<ProposalLedger | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const proposals = await getProposals(session, contractAddress);
        if (cancelled) return;
        const found = proposals.find((p) => p.id.toString() === id);
        setProposal(found ?? null);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [session, contractAddress, id]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-6">You need to connect your wallet to read live proposals.</p>
          <Link to="/connect" className="btn-primary inline-block">Connect Wallet</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-4xl font-bold mb-4">Loading Proposal</h1>
          <p className="text-gray-400">Fetching on-chain state...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Proposal Not Found</h1>
          {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
          <Link to="/proposals" className="btn-primary inline-block">Back to Proposals</Link>
        </div>
      </div>
    );
  }

  const totalVotes = Number(proposal.yes) + Number(proposal.no) + Number(proposal.abstain);
  const yesPct = totalVotes > 0 ? (Number(proposal.yes) / totalVotes) * 100 : 0;

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
                  <span className="px-3 py-1 text-sm font-semibold rounded-md bg-green-500/20 text-green-400 border border-green-500/30">
                    Active
                  </span>
                  <span className="text-gray-400 text-sm ml-2">#{proposal.id.toString()}</span>
                </div>
                {address && (
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
              <h2 className="text-xl font-bold mb-6">Live Voting Results</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Votes" value={totalVotes} icon="📊" />
                <StatCard label="Yes" value={`${Number(proposal.yes)} (${yesPct.toFixed(1)}%)`} icon="✅" />
                <StatCard label="Voters Anonymous" value="ZK" icon="🔐" />
              </div>

              <div className="space-y-4">
                <VoteBar label="YES" value={Number(proposal.yes)} total={totalVotes} color="green" />
                <VoteBar label="NO" value={Number(proposal.no)} total={totalVotes} color="red" />
                <VoteBar label="ABSTAIN" value={Number(proposal.abstain)} total={totalVotes} color="gray" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Proposal Info</h3>
              <div className="space-y-4 text-sm">
                <InfoRow label="Proposal ID" value={`#${proposal.id.toString()}`} />
                <InfoRow label="Status" value="Active" valueClass="text-green-400" />
                <InfoRow label="Yes" value={proposal.yes.toString()} valueClass="text-green-400" />
                <InfoRow label="No" value={proposal.no.toString()} valueClass="text-red-400" />
                <InfoRow label="Abstain" value={proposal.abstain.toString()} />
              </div>
            </div>

            {!address && (
              <div className="glass-panel p-6 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="font-bold mb-2">Connect Wallet to Vote</h3>
                <p className="text-gray-400 text-sm mb-4">You need to connect your wallet to participate in voting.</p>
                <Link to="/connect" className="btn-primary inline-block">Connect Wallet</Link>
              </div>
            )}

            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">How Voting Works</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <StepItem number="1" text="Your vote choice is disclosed to the public tally" />
                <StepItem number="2" text="Your identity stays anonymous — only a nullifier is recorded" />
                <StepItem number="3" text="The ZK proof is generated and submitted on-chain via your wallet" />
                <StepItem number="4" text="Live results update as votes are cast on Midnight Preview" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-[#0B0F19]/50 rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value}</p>
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
