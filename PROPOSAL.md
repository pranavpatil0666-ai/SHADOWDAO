# Product Proposal

## What is the product, and who uses it?
**ShadowDAO** is a privacy-first decentralized autonomous organization (DAO) platform. It allows communities, DAOs, and corporate governance bodies to conduct fully anonymous on-chain voting. The product is used by DAO members and token holders who wish to express their governance preferences (YES / NO / ABSTAIN) without fear of retaliation, social pressure, or revealing their strategic voting positions to whales or competitors.

## Why Midnight specifically?
A transparent blockchain (like Ethereum or Cardano) forces all votes and the identities of voters to be entirely public. This leads to issues like "voter intimidation," "herd mentality," and strategic voting where members wait to see how whales vote. 

Midnight specifically solves this by providing native zero-knowledge smart contracts (Compact). With Midnight, ShadowDAO can publicly verify that a vote is valid (the user has the right to vote and hasn't voted yet) while keeping the actual vote choice completely private. This is extremely difficult and expensive to build on transparent chains, but native and efficient on Midnight.

## Data Model
| Data Point                   | Type           | Disclosed To |
|------------------------------|----------------|--------------|
| Total Votes Cast             | Public ledger  | Everyone     |
| Proposal Details (Title, ID) | Public ledger  | Everyone     |
| Voter Credential/Identity    | Private witness| No one (ZK Proved) |
| Vote Choice (YES/NO)         | Private witness| No one (ZK Proved) |
| Nullifier (Double-vote protection) | Public ledger | Everyone |

## Mainnet Feasibility
**Yes, it is highly feasible to reach Mainnet by Level 6.** 
The core voting mechanics (commitment generation, nullifiers, and public tallying) only require basic cryptographic primitives that are already supported by the Compact language and Midnight network. The frontend integration using Midnight.js is complete, and Lace wallet support works end-to-end. The remaining work involves refining the access-control logic (e.g., integrating actual token-weighted governance) and polishing the UI, which are standard Web3 tasks and do not rely on pending Midnight features.
