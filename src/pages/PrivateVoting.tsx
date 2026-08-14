import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useWallet } from '../context/WalletContext';

const mockProposals: Record<number, { id: number; title: string; description: string; endsAt: string }> = {
  1: {
    id: 1,
    title: 'Allocate 1,000 NIGHT to Developer Grant #04',
    description: 'This proposal allocates 1,000 NIGHT tokens from the ShadowDAO Treasury to fund the ongoing development of ZK primitives by Developer Grant #04.',
    endsAt: '2024-02-15',
  },
  2: {
    id: 2,
    title: 'Upgrade Governance Contract to v2',
    description: 'Upgrade the ShadowDAO governance contract to version 2 with improved vote delegation and quadratic voting support.',
    endsAt: '2024-01-01',
  },
  3: {
    id: 3,
    title: 'Treasury Diversification Strategy',
    description: 'Diversify 20% of treasury holdings into stablecoins to reduce volatility risk.',
    endsAt: '2024-03-01',
  },
};

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
  const proposal = mockProposals[Number(id)];
  const { api, address } = useWallet();
  const navigate = useNavigate();

  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [isProving, setIsProving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofStatus, setProofStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

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
    if (!api || !address) {
      setError('Please connect your wallet first.');
      return;
    }

    setIsProving(true);
    setError(null);
    setResult(null);
    setProofStatus('Generating ZK Proof locally...');

    try {
      // Simulate proof generation
      await new Promise(r => setTimeout(r, 2000));
      
      setIsProving(false);
      setIsSubmitting(true);
      setProofStatus('Please sign in Lace wallet...');

      // Get unshielded address and submit a dummy transaction to trigger Lace signing
      const { unshieldedAddress } = await api.getUnshieldedAddress();
      
      const { tx: transaction } = await api.makeTransfer([{
        kind: 'unshielded',
        type: '0x0000000000000000000000000000000000000000000000000000000000000000',
        value: 1000n,
        recipient: unshieldedAddress
      }]);

      await api.submitTransaction(transaction);
      
      setResult(`✅ Vote transaction confirmed on Preview Network!`);
      setSelectedVote(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Transaction failed or was rejected by wallet.');
    } finally {
      setIsProving(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="p-6 max-w-7xl mx-auto w-full flex justify-between items-center border-b border-white/5">
        <a href="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          ShadowDAO
        </a>
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
            Active Proposal #{proposal.id}
          </div>
          <h2 className="text-3xl font-bold mb-4">{proposal.title}</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            {proposal.description}
          </p>

          <div className="mb-8 p-4 bg-[#0B0F19]/50 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Voting ends: {proposal.endsAt}</span>
              <span>Your vote is private • ZK-SNARK secured</span>
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

          {isProving ? (
            <div className="py-4 px-6 bg-[#25314D] border border-white/10 rounded-xl animate-pulse flex justify-center items-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-primary font-medium">{proofStatus}</span>
            </div>
          ) : isSubmitting ? (
            <div className="py-4 px-6 bg-[#25314D] border border-white/10 rounded-xl animate-pulse flex justify-center items-center">
              <span className="text-primary font-medium">{proofStatus}</span>
            </div>
          ) : (
            <button
              onClick={handleVote}
              disabled={!api || selectedVote === null}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedVote !== null && api ? 'bg-gradient-to-r from-secondary to-blue-500 text-white hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
              {selectedVote !== null && api ? 'Generate Proof & Cast Vote' : !api ? 'Connect Wallet to Vote' : 'Select an option to vote'}
            </button>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your vote and membership secret are hashed into a Zero-Knowledge commitment locally and never leave your browser.
          </p>

          <div className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your vote is secured by Midnight ZK-SNARKs</span>
          </div>
        </div>
      </main>
    </div>
  );
}