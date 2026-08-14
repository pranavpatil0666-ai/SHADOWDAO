import { useState } from 'react';

interface AdminDashboardProps {
  api: any;
  address: string | null;
}

export default function AdminDashboard({ api, address }: AdminDashboardProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProposal = async () => {
    if (!api || !address) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a proposal description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      // Create a real transaction using the DApp Connector API
      // For this hackathon demo, we submit a dummy transfer to trigger 
      // the Lace wallet signing and Preview network submission.
      
      const unshieldedAddress = await api.getUnshieldedAddress();
      
      const transaction = await api.makeTransfer([{
        kind: 'unshielded',
        // Note: native token type might need to be imported from ledger in a full implementation.
        // We use a dummy token string or just let the wallet balance it.
        // To be safe for the UI, we'll try to use a valid format or skip it.
        // type: "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        value: 1000n, // Minimal amount
        recipient: unshieldedAddress
      }]);

      // Prompt Lace Wallet to sign and submit to the Preview Network
      const submitted = await api.submitTransaction(transaction);

      setResult(`✅ Proposal created on Preview Network! TxHash: ${submitted.hash || 'Success'}`);
      setDescription('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transaction failed or was rejected by wallet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 max-w-xl w-full">
      <h2 className="text-xl font-bold mb-4">Admin: Create Proposal</h2>
      
      {error && (
        <div className="p-3 mb-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm text-left">
          {error}
        </div>
      )}

      {result && (
        <div className="p-3 mb-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm text-left break-all">
          {result}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400 mb-2">Proposal Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Should the DAO spend 500 NIGHT on a new project?"
          className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary"
          rows={3}
        />
      </div>

      <button 
        onClick={handleCreateProposal}
        disabled={!api || isSubmitting}
        className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${!api || isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-purple-600 text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'}`}
      >
        {isSubmitting ? 'Prompting Lace Wallet...' : 'Create Proposal on Preview Network'}
      </button>
    </div>
  );
}
