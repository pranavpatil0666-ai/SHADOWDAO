import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Proposal = { title: string;
                         description: string;
                         yes: bigint;
                         no: bigint;
                         abstain: bigint
                       };

export type VoteNullifier = { proposalId: bigint; voterSecret: Uint8Array };

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  create_proposal(context: __compactRuntime.CircuitContext<PS>,
                  proposal_id_0: bigint,
                  title_0: string,
                  description_0: string): __compactRuntime.CircuitResults<PS, []>;
  vote(context: __compactRuntime.CircuitContext<PS>,
       proposal_id_0: bigint,
       choice_0: bigint,
       member_secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type ProvableCircuits<PS> = {
  create_proposal(context: __compactRuntime.CircuitContext<PS>,
                  proposal_id_0: bigint,
                  title_0: string,
                  description_0: string): __compactRuntime.CircuitResults<PS, []>;
  vote(context: __compactRuntime.CircuitContext<PS>,
       proposal_id_0: bigint,
       choice_0: bigint,
       member_secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  create_proposal(context: __compactRuntime.CircuitContext<PS>,
                  proposal_id_0: bigint,
                  title_0: string,
                  description_0: string): __compactRuntime.CircuitResults<PS, []>;
  vote(context: __compactRuntime.CircuitContext<PS>,
       proposal_id_0: bigint,
       choice_0: bigint,
       member_secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  proposals: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Proposal;
    [Symbol.iterator](): Iterator<[bigint, Proposal]>
  };
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
