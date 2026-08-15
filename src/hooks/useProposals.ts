import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { getProposals, getTotalVotes, type ProposalLedger } from '../midnight-utils';

export interface ProposalWithMeta extends ProposalLedger {
  totalVotes: number;
  status: 'Active';
}

export function useProposals(pollMs = 8000) {
  const { session, contractAddress } = useWallet();
  const [proposals, setProposals] = useState<ProposalWithMeta[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session || !contractAddress) return;
    setIsLoading(true);
    setError(null);
    try {
      const [proposals, totalVotes] = await Promise.all([
        getProposals(session, contractAddress),
        getTotalVotes(session, contractAddress),
      ]);
      setProposals(
        proposals.map((p) => ({
          ...p,
          totalVotes: Number(p.yes) + Number(p.no) + Number(p.abstain),
          status: 'Active' as const,
        })),
      );
      setTotalVotes(totalVotes);
    } catch (e: any) {
      console.error('useProposals:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [session, contractAddress]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  return { proposals, totalVotes, isLoading, error, refresh };
}
