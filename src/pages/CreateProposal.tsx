import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useProposals } from '../hooks/useProposals';
import { createProposal } from '../midnight-utils';

export default function CreateProposal() {
  const { session, contractAddress } = useWallet();
  const { proposals } = useProposals();
  const navigate = useNavigate();

  const nextId = proposals.length > 0
    ? proposals.reduce((max, p) => (p.id > max ? p.id : max), 0n) + 1n
    : 1n;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!session || !title.trim()) return;
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    setStatus('Generating ZK proof and submitting to the contract...');

    try {
      const txId = await createProposal(session, contractAddress, nextId, title.trim(), description.trim() || 'No description provided.');
      setStatus('');
      setResult(`Proposal #${nextId} created on-chain! Tx: ${txId.slice(0, 20)}...`);
      setTitle('');
      setDescription('');
      setTimeout(() => navigate('/proposals'), 2500);
    } catch (e: any) {
      console.error(e);
      setStatus('');
      setError(e.message || 'Transaction failed or was rejected by wallet.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <main className="p-6 max-w-3xl mx-auto w-full">
        <Link to="/proposals" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Proposals
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Create Proposal</h1>
          <p className="text-gray-400">
            Submits a new proposal to the ShadowDAO Compact contract on Midnight Preview.
          </p>
        </div>

        {!session && (
          <div className="glass-panel p-6 mb-8 text-center">
            <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-4">You need a connected wallet to create an on-chain proposal.</p>
            <Link to="/connect" className="btn-primary inline-block">Connect Wallet</Link>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 mb-6 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm">
            {result}
          </div>
        )}

        <div className="glass-panel p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Proposal ID</label>
            <input
              readOnly
              value={`#${nextId.toString()}`}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white opacity-60"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-assigned from the highest on-chain proposal id + 1.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Allocate 1,000 NIGHT to Developer Grant"
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Describe the proposal. Stored on-chain."
              className="w-full bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
            />
          </div>

          {isSubmitting ? (
            <div className="py-4 px-6 bg-[#25314D] border border-white/10 rounded-xl animate-pulse flex justify-center items-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-primary font-medium">{status}</span>
            </div>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!session || !title.trim() || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${title.trim() && session ? 'bg-gradient-to-r from-secondary to-blue-500 text-white hover:scale-[1.01]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            >
              {!session ? 'Connect Wallet to Create' : !title.trim() ? 'Enter a title' : 'Create Proposal On-Chain'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
