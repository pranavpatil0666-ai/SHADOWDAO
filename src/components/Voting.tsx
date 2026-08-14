import { useState } from 'react';
import { submitVote } from '../midnight-utils';

export default function Voting({ proposalId, onBack, laceApi, contractAddress }: { proposalId: number | null, onBack: () => void, laceApi: any, contractAddress: string }) {
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proofStatus, setProofStatus] = useState<string>('');

  const handleVote = async () => {
    if (selectedVote === null) return;
    if (!laceApi) {
      alert("Please connect your Lace Wallet first!");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      setProofStatus('Securing Vote Choice Witness & Generating ZK Proof...');
      
      await submitVote(laceApi, contractAddress, proposalId || 1, selectedVote);

      alert('Vote cast successfully! Your choice remains completely private, while the public tally has been updated securely.');
      onBack();
    } catch (e: any) {
      console.error(e);
      alert('Transaction failed: ' + (e.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in mt-10">
      <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors flex items-center text-sm mb-6">
        ← Back to Dashboard
      </button>

      <div className="glass-panel p-8">
        <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-md border border-green-500/30 mb-4">
          Active Proposal #{proposalId}
        </div>
        <h2 className="text-3xl font-bold mb-4">Allocate 1,000 NIGHT to Developer Grant #04</h2>
        <p className="text-gray-300 leading-relaxed mb-8">
          This proposal allocates 1,000 NIGHT tokens from the ShadowDAO Treasury to fund the ongoing development of ZK primitives by Developer Grant #04. 
          Your vote will be cast using Midnight's Compact smart contracts. Your individual choice is never revealed on-chain.
        </p>

        <div className="space-y-4 mb-8">
          {[ 
            { id: 0, label: 'YES', desc: 'Approve the allocation', color: 'border-green-500/50 hover:border-green-400 bg-green-500/10' },
            { id: 1, label: 'NO', desc: 'Reject the allocation', color: 'border-red-500/50 hover:border-red-400 bg-red-500/10' },
            { id: 2, label: 'ABSTAIN', desc: 'Abstain from voting', color: 'border-gray-500/50 hover:border-gray-400 bg-gray-500/10' }
          ].map(option => (
            <div 
              key={option.id}
              onClick={() => !isSubmitting && setSelectedVote(option.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${option.color} ${selectedVote === option.id ? 'ring-2 ring-white scale-[1.02] border-opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-opacity-30'} ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">{option.label}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedVote === option.id ? 'border-white' : 'border-gray-500'}`}>
                  {selectedVote === option.id && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-1">{option.desc}</p>
            </div>
          ))}
        </div>

        {isSubmitting ? (
          <div className="p-4 bg-surfaceLight rounded-xl border border-white/10 text-center animate-pulse">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-primary font-medium">{proofStatus}</p>
            <p className="text-xs text-gray-400 mt-1">Operating off-chain. Do not close wallet.</p>
          </div>
        ) : (
          <button 
            onClick={handleVote} 
            disabled={selectedVote === null}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedVote !== null ? 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            {selectedVote !== null ? 'Generate Proof & Cast Vote' : 'Select an option to vote'}
          </button>
        )}
      </div>
      
      <div className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        <span>Your vote is secured by Midnight ZK-SNARKs</span>
      </div>
    </div>
  );
}
