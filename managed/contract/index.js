import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_1 = new __compactRuntime.CompactTypeBytes(32);

class _VoteWitness_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      pollId: _descriptor_0.fromValue(value_0),
      voteChoice: _descriptor_0.fromValue(value_0),
      voterSecret: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.pollId).concat(_descriptor_0.toValue(value_0.voteChoice).concat(_descriptor_1.toValue(value_0.voterSecret)));
  }
}

const _descriptor_2 = new _VoteWitness_0();

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_4 = __compactRuntime.CompactTypeBoolean;

class _Either_0 {
  alignment() {
    return _descriptor_4.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_4.fromValue(value_0),
      left: _descriptor_1.fromValue(value_0),
      right: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_4.toValue(value_0.is_left).concat(_descriptor_1.toValue(value_0.left).concat(_descriptor_1.toValue(value_0.right)));
  }
}

const _descriptor_5 = new _Either_0();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_7 = new _ContractAddress_0();

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      create_proposal: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`create_proposal: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const proposal_id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('create_proposal',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadow_dao.compact line 19 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(proposal_id_0) === 'bigint' && proposal_id_0 >= 0n && proposal_id_0 <= 4294967295n)) {
          __compactRuntime.typeError('create_proposal',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'shadow_dao.compact line 19 char 1',
                                     'Uint<0..4294967296>',
                                     proposal_id_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(proposal_id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._create_proposal_0(context,
                                                 partialProofData,
                                                 proposal_id_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      vote: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`vote: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const proposal_id_0 = args_1[1];
        const choice_0 = args_1[2];
        const member_secret_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('vote',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadow_dao.compact line 24 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(proposal_id_0) === 'bigint' && proposal_id_0 >= 0n && proposal_id_0 <= 4294967295n)) {
          __compactRuntime.typeError('vote',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'shadow_dao.compact line 24 char 1',
                                     'Uint<0..4294967296>',
                                     proposal_id_0)
        }
        if (!(typeof(choice_0) === 'bigint' && choice_0 >= 0n && choice_0 <= 4294967295n)) {
          __compactRuntime.typeError('vote',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'shadow_dao.compact line 24 char 1',
                                     'Uint<0..4294967296>',
                                     choice_0)
        }
        if (!(member_secret_0.buffer instanceof ArrayBuffer && member_secret_0.BYTES_PER_ELEMENT === 1 && member_secret_0.length === 32)) {
          __compactRuntime.typeError('vote',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'shadow_dao.compact line 24 char 1',
                                     'Bytes<32>',
                                     member_secret_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(proposal_id_0).concat(_descriptor_0.toValue(choice_0).concat(_descriptor_1.toValue(member_secret_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._vote_0(context,
                                      partialProofData,
                                      proposal_id_0,
                                      choice_0,
                                      member_secret_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      create_proposal: this.circuits.create_proposal,
      vote: this.circuits.vote
    };
    this.provableCircuits = {
      create_proposal: this.circuits.create_proposal,
      vote: this.circuits.vote
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('create_proposal', new __compactRuntime.ContractOperation());
    state_0.setOperation('vote', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_2, value_0);
    return result_0;
  }
  _create_proposal_0(context, partialProofData, proposal_id_0) {
    proposal_id_0;
    const tmp_0 = 0n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _vote_0(context, partialProofData, proposal_id_0, choice_0, member_secret_0) {
    proposal_id_0;
    const tmp_0 = ((t1) => {
                    if (t1 > 4294967295n) {
                      throw new __compactRuntime.CompactError('shadow_dao.compact line 33 char 19: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 4294967295');
                    }
                    return t1;
                  })(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_8.toValue(0n),
                                                                                                           alignment: _descriptor_8.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value)
                     +
                     1n);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return this._persistentHash_0({ pollId: proposal_id_0,
                                    voteChoice: choice_0,
                                    voterSecret: member_secret_0 });
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get total_votes() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(0n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
