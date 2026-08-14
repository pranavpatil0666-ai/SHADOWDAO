import { useState } from 'react';

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);

    try {
      // Simulate creating a new proposal on the Midnight Network
      await new Promise(r => setTimeout(r, 2000));
      alert(`Proposal "${title}" created successfully on the Midnight Preview Network!`);
      onBack();
    } catch (err: any) {
      alert("Failed to create proposal: " + err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in mt-10">
      <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors flex items-center text-sm mb-6">
        ← Back to Dashboard
      </button>

      <div className="glass-panel p-8">
        <h2 className="text-3xl font-bold mb-2">Create New Proposal</h2>
        <p className="text-gray-400 mb-8">Deploy a new governance proposal to the ShadowDAO contract.</p>

        <form onSubmit={handleCreateProposal} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Proposal Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Allocate 1,000 NIGHT to Dev Grant"
              className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description / Rationale</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Explain why the DAO should vote for this proposal..."
              className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button 
              type="submit" 
              disabled={isDeploying || !title || !description}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${(!title || !description || isDeploying) ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]'}`}
            >
              {isDeploying ? 'Deploying to Midnight Network...' : 'Submit Proposal on-chain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
