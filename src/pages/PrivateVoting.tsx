import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { getProposals, submitVote, type ProposalLedger } from '../midnight-utils';

const VOTE_CHOICES = [
  { id: 0, label: 'YES', desc: 'Approve the proposal', color: 'green' },
  { id: 1, label: 'NO', desc: 'Reject the proposal', color: 'red' },
  { id: 2, label: 'ABSTAIN', desc: 'Abstain from voting', color: 'gray' },
];

const COLOR_CLASSES = {
  green: 'border-green-500/50 hover:border-green-400 bg-green-500/10',
  red: 'border-red-500/50 hover:border-red-400 bg-red-500/10',
  gray: 'border-gray-500/50 hover:border-gray-400 bg-gray-500/10',
};

const SELECTED_CLASSES = {
  green: 'ring-2 ring-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]',
  red: 'ring-2 ring-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
  gray: 'ring-2 ring-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.4)]',
};

export default function PrivateVoting() {
  const { id } = useParams<{ id: string }>();
  const proposalId = BigInt(id || '0');
  const { session, contractAddress } = useWallet();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<ProposalLedger | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [isProving, setIsProving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofStatus, setProofStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const proposals = await getProposals(session, contractAddress);
        if (cancelled) return;
        setProposal(proposals.find((p) => p.id === proposalId) ?? null);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [session, contractAddress, proposalId]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-6">You need to connect your wallet to cast a private vote.</p>
          <Link to="/connect" className="btn-primary">Connect Wallet</Link>
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
          <button onClick={() => navigate('/proposals')} className="btn-primary">Back to Proposals</button>
        </div>
      </div>
    );
  }

  const handleVote = async () => {
    if (selectedVote === null) return;
    if (!session) {
      setError('Please connect your wallet first.');
      return;
    }

    setIsProving(true);
    setError(null);
    setResult(null);
    setProofStatus('Generating ZK Proof locally...');

    try {
      const txId = await submitVote(session, contractAddress, proposal.id, selectedVote);

      setIsProving(false);
      setIsSubmitting(false);
      setResult(`Vote submitted on-chain! Tx: ${txId.slice(0, 20)}...`);
      setSelectedVote(null);
      setProofStatus('');
    } catch (err: any) {
      console.error(err);
      setIsProving(false);
      setIsSubmitting(false);
      setProofStatus('');
      setError(err.message || 'Transaction failed or was rejected by wallet.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center border-b border-white/5">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ShadowDAO
        </Link>
      </header>

      <main className="p-6 max-w-3xl mx-auto w-full">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors flex items-center text-sm mb-6">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Proposal
        </button>

        <div className="glass-panel p-8">
          <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-md border border-green-500/30 mb-4">
            Active Proposal #{proposal.id.toString()}
          </div>
          <h2 className="text-3xl font-bold mb-4">{proposal.title}</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            {proposal.description}
          </p>

          <div className="mb-8 p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Your vote choice is public (tally), your identity is anonymous</span>
              <span>ZK-SNARK secured</span>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 mb-6 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm break-all">
              {result}
            </div>
          )}

          <div className="space-y-4 mb-8">
            {VOTE_CHOICES.map((option) => (
              <div
                key={option.id}
                onClick={() => !isProving && !isSubmitting && setSelectedVote(option.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${COLOR_CLASSES[option.color as keyof typeof COLOR_CLASSES]} ${
                  selectedVote === option.id ? SELECTED_CLASSES[option.color as keyof typeof SELECTED_CLASSES] : 'border-opacity-30'
                } ${isProving || isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{option.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedVote === option.id ? 'border-white' : 'border-gray-500'
                  }`}>
                    {selectedVote === option.id && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-1">{option.desc}</p>
              </div>
            ))}
          </div>

          {isProving || isSubmitting ? (
            <div className="py-4 px-6 bg-[#25314D] border border-white/10 rounded-xl animate-pulse flex justify-center items-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-primary font-medium">{proofStatus}</span>
            </div>
          ) : (
            <button
              onClick={handleVote}
              disabled={!session || selectedVote === null}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedVote !== null && session ? 'bg-gradient-to-r from-secondary to-blue-500 text-white hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
              {selectedVote !== null && session ? 'Generate Proof & Cast Vote' : !session ? 'Connect Wallet to Vote' : 'Select an option to vote'}
            </button>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your identity and membership secret are kept private via a ZK nullifier — only your choice contributes to the public tally.
          </p>
        </div>
      </main>
    </div>
  );
}
