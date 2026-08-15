import { describe, it, expect, beforeEach } from 'vitest';

class SimulatedShadowDAO {
  proposals: Map<number, { title: string; description: string; yes: number; no: number; abstain: number }> =
    new Map();
  nullifiers: Set<string> = new Set();

  create_proposal(proposal_id: number, title: string, description: string) {
    if (this.proposals.has(proposal_id)) {
      throw new Error('proposal already exists');
    }
    this.proposals.set(proposal_id, { title, description, yes: 0, no: 0, abstain: 0 });
  }

  vote(proposal_id: number, choice: number, member_secret: string): string {
    if (choice < 0 || choice > 2) {
      throw new Error('invalid choice');
    }
    if (!this.proposals.has(proposal_id)) {
      throw new Error('proposal does not exist');
    }

    const nullifier = `hash(${proposal_id},${member_secret})`;
    if (this.nullifiers.has(nullifier)) {
      throw new Error('already voted on this proposal');
    }
    this.nullifiers.add(nullifier);

    const p = this.proposals.get(proposal_id)!;
    if (choice === 0) p.yes += 1;
    else if (choice === 1) p.no += 1;
    else p.abstain += 1;
    this.proposals.set(proposal_id, p);

    return nullifier;
  }
}

describe('ShadowDAO Contract Logic', () => {
  let dao: SimulatedShadowDAO;

  beforeEach(() => {
    dao = new SimulatedShadowDAO();
  });

  it('should create a proposal with zero tallies', () => {
    dao.create_proposal(1, 'Grant #1', 'Fund dev');
    expect(dao.proposals.get(1)).toEqual({ title: 'Grant #1', description: 'Fund dev', yes: 0, no: 0, abstain: 0 });
  });

  it('should reject duplicate proposal ids', () => {
    dao.create_proposal(1, 'Grant #1', 'Fund dev');
    expect(() => dao.create_proposal(1, 'Duplicate', 'Rejected')).toThrow('already exists');
  });

  it('should tally a yes vote', () => {
    dao.create_proposal(1, 'Grant #1', 'Fund dev');
    dao.vote(1, 0, 'secret_alice');
    const p = dao.proposals.get(1)!;
    expect(p.yes).toBe(1);
    expect(p.no).toBe(0);
    expect(p.abstain).toBe(0);
  });

  it('should tally no and abstain votes correctly', () => {
    dao.create_proposal(1, 'Grant #1', 'Fund dev');
    dao.vote(1, 1, 'secret_bob');
    dao.vote(1, 2, 'secret_carol');
    const p = dao.proposals.get(1)!;
    expect(p.yes).toBe(0);
    expect(p.no).toBe(1);
    expect(p.abstain).toBe(1);
  });

  it('should reject double voting by the same secret', () => {
    dao.create_proposal(1, 'Grant #1', 'Fund dev');
    dao.vote(1, 0, 'secret_alice');
    expect(() => dao.vote(1, 0, 'secret_alice')).toThrow('already voted');
  });

  it('should allow the same secret to vote on different proposals', () => {
    dao.create_proposal(1, 'Grant #1', 'Fund dev');
    dao.create_proposal(2, 'Grant #2', 'Fund infra');
    dao.vote(1, 0, 'secret_alice');
    expect(() => dao.vote(2, 1, 'secret_alice')).not.toThrow();
  });

  it('should reject invalid choices', () => {
    dao.create_proposal(1, 'Grant #1', 'Fund dev');
    expect(() => dao.vote(1, 3, 'secret_alice')).toThrow('invalid choice');
  });

  it('should reject votes on non-existent proposals', () => {
    expect(() => dao.vote(99, 0, 'secret_alice')).toThrow('does not exist');
  });
});
