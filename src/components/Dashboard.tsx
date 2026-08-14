
import { useState, useEffect } from 'react';
import { getContractState } from '../midnight-utils';

interface Proposal {
  id: number;
  title: string;
  status: 'Active' | 'Executed';
  totalVotes: number;
  yes?: number;
  no?: number;
  abstain?: number;
}

export default function Dashboard({ onVoteClick, laceApi, contractAddress }: { onVoteClick: (id: number) => void, laceApi: any, contractAddress: string }) {
  const [proposals, setProposals] = useState<Proposal[]>([
    { id: 1, title: 'Allocate 1,000 NIGHT to Developer Grant #04', status: 'Active', totalVotes: 0 },
    { id: 2, title: 'Upgrade Governance Contract to v2', status: 'Executed', totalVotes: 156, yes: 110, no: 30, abstain: 16 },
  ]);

  useEffect(() => {
    if (laceApi) {
      getContractState(laceApi, contractAddress).then((state) => {
        setProposals(prev => {
          const updated = [...prev];
          updated[0].totalVotes = state.total_votes;
          return updated;
        });
      }).catch(console.error);
    }
  }, [laceApi, contractAddress]);

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-2">DAO Treasury Dashboard</h1>
        <p className="text-gray-400">Vote securely on Midnight. Your choice is private, the outcome is public.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 border-t-4 border-t-primary">
          <h3 className="text-gray-400 text-sm font-medium">Treasury Balance</h3>
          <p className="text-3xl font-bold mt-2">1,250,000 NIGHT</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-t-secondary">
          <h3 className="text-gray-400 text-sm font-medium">Active Proposals</h3>
          <p className="text-3xl font-bold mt-2">1</p>
        </div>
        <div className="glass-panel p-6 border-t-4 border-t-green-500">
          <h3 className="text-gray-400 text-sm font-medium">My Voting Power</h3>
          <p className="text-3xl font-bold mt-2">1,500 REP</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Proposals</h2>
        {proposals.map((p) => (
          <div key={p.id} className="glass-panel p-6 flex flex-col md:flex-row justify-between items-center transition-all hover:bg-surfaceLight/50">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-md ${p.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700/50 text-gray-300 border border-gray-600'}`}>
                  {p.status}
                </span>
                <span className="text-gray-400 text-sm">#{p.id}</span>
              </div>
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-400 mt-1">Total public votes: {p.totalVotes}</p>
            </div>
            
            <div>
              {p.status === 'Active' ? (
                <button 
                  onClick={() => onVoteClick(p.id)}
                  className="btn-primary"
                >
                  Vote Privately
                </button>
              ) : (
                <div className="flex space-x-4 text-sm font-medium">
                  <div className="text-green-400">Yes: {p.yes}</div>
                  <div className="text-red-400">No: {p.no}</div>
                  <div className="text-gray-400">Abstain: {p.abstain}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
