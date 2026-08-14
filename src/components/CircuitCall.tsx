import { useCallback, useEffect, useState } from 'react';
import type { ConnectedSession } from '../lib/midnight';
import { callVote, readVotes } from '../lib/midnight';

interface CircuitCallProps {
  session: ConnectedSession | null;
  contractAddress: string;
}

const CHOICES = [
  { id: 0, label: 'YES' },
  { id: 1, label: 'NO' },
  { id: 2, label: 'ABSTAIN' },
];

export default function CircuitCall({ session, contractAddress }: CircuitCallProps) {
  const [proposalId, setProposalId] = useState<bigint>(1n);
  const [choice, setChoice] = useState<number | null>(null);
  const [isProving, setIsProving] = useState(false);
  const [result, setResult] = useState<{ txId: string; votes: bigint } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentVotes, setCurrentVotes] = useState<bigint | null>(null);

  const refreshVotes = useCallback(async () => {
    if (!session || !contractAddress) return;
    try {
      const votes = await readVotes(session, contractAddress);
      setCurrentVotes(votes);
    } catch (e: any) {
      console.error('Failed to read contract state:', e);
    }
  }, [session, contractAddress]);

  useEffect(() => {
    refreshVotes();
  }, [refreshVotes]);

  const handleCallCircuit = async () => {
    if (!session) {
      setError('Please connect your wallet first.');
      return;
    }
    if (choice === null) {
      setError('Select a vote choice first.');
      return;
    }

    setIsProving(true);
    setError(null);
    setResult(null);

    try {
      const memberSecret = crypto.getRandomValues(new Uint8Array(32));
      const { txId, votes } = await callVote(
        session,
        contractAddress,
        proposalId,
        BigInt(choice),
        memberSecret,
      );
      setResult({ txId, votes });
      setCurrentVotes(votes);
    } catch (err: any) {
      setError(err?.message ?? 'Circuit call failed.');
    } finally {
      setIsProving(false);
    }
  };

  return (
    <div className="p-6 bg-surface/80 backdrop-blur-md rounded-2xl border border-white/10 max-w-xl w-full text-center">
      <h2 className="text-xl font-bold mb-2">Interact with Contract</h2>
      <p className="text-gray-400 text-sm mb-6">Proved without revealing your input</p>

      {error && (
        <div className="p-3 mb-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm text-left">
          {error}
        </div>
      )}

      <div className="mb-4 text-left">
        <label className="block text-sm font-medium text-gray-300 mb-1">Proposal ID</label>
        <input
          type="number"
          min={1}
          value={proposalId.toString()}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v) && v >= 1) setProposalId(BigInt(Math.floor(v)));
          }}
          className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
      </div>

      <div className="mb-4 text-left">
        <label className="block text-sm font-medium text-gray-300 mb-2">Your vote (kept private)</label>
        <div className="grid grid-cols-3 gap-2">
          {CHOICES.map((c) => (
            <button
              key={c.id}
              onClick={() => setChoice(c.id)}
              disabled={isProving}
              className={`py-2 rounded-xl font-bold transition-all border ${
                choice === c.id
                  ? 'bg-gradient-to-r from-secondary to-blue-500 text-white border-transparent shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-surfaceLight text-gray-300 border-white/10 hover:border-primary'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center text-xs text-gray-500 bg-surfaceLight/50 rounded-lg px-3 py-2">
        <span>Public vote tally (on-chain):</span>
        <span className="font-mono text-gray-300">{currentVotes?.toString() ?? '—'}</span>
      </div>

      {result && (
        <div className="p-3 mb-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm text-left break-all">
          <p className="font-semibold mb-1">Transaction confirmed!</p>
          <p>txId: {result.txId}</p>
          <p>Total public votes: {result.votes.toString()}</p>
        </div>
      )}

      {isProving ? (
        <div className="py-3 px-6 bg-surfaceLight border border-white/10 rounded-xl animate-pulse flex justify-center items-center">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-primary font-medium">Generating ZK Proof locally...</span>
        </div>
      ) : (
        <button
          onClick={handleCallCircuit}
          disabled={!session || choice === null}
          className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
            !session || choice === null
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-secondary to-blue-500 text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]'
          }`}
        >
          Call Circuit (Vote)
        </button>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Your vote and membership secret are hashed into a Zero-Knowledge commitment locally and never leave your browser.
      </p>
    </div>
  );
}