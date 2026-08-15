# ShadowDAO
![CI](https://github.com/pranavpatil0666-ai/SHADOWDAO/actions/workflows/ci.yml/badge.svg)
> Private governance on Midnight — vote with a Zero-Knowledge proof, never reveal your choice.

## Live Demo
https://shadow-dao-eight.vercel.app

## Contract Address
| Network  | Address                          |
|----------|----------------------------------|
| Preprod  | 7145c6c7fe1b3bab9f25f5e6733f707f52f6d0edfca58add696f4301170b0f5d |

## What This Does
ShadowDAO is a privacy-first decentralized autonomous organization. Members connect their Lace wallet, then vote YES / NO / ABSTAIN on a proposal. The vote is sealed into a Zero-Knowledge commitment locally in the browser and submitted to a Compact smart contract on the Midnight Preview network. The chain only ever learns that a vote happened — the public `total_votes` counter increments — and never learns which option was chosen.

## Privacy Model
- **PUBLIC**: The contract's `total_votes` counter (the number of votes cast).
- **PRIVATE**: The individual choice (YES/NO/ABSTAIN) and the member's secret credential.
- **PROVED without revealing**: That they cast a valid vote (a Zero-Knowledge proof is generated locally from a commitment over `{proposal_id, choice, member_secret}`). The choice and secret never appear in the UI, the network, or the ledger.

## Privacy Claim
An on-chain observer sees a `vote` circuit call and the public tally incrementing. They cannot see who voted, which option was chosen, or the member secret — only that a valid proof was produced and submitted.

## Tech Stack
- Network: Midnight
- Language: Compact
- SDK: Midnight.js SDK
- Frontend: React / Vite / Tailwind CSS
- Wallet: Lace
- Hosting: Vercel

## Prerequisites
- Lace wallet extension installed, connected to Midnight Preview
- Node.js v22+
- Docker (only needed to run the local proof server during deployment)

## Setup & Run Locally
1. Clone the repository
```bash
git clone https://github.com/pranavpatil0666-ai/SHADOWDAO.git
cd SHADOWDAO
```
2. Install dependencies
```bash
npm install
```
3. Sync the compiled ZK assets into `public/`
```bash
npm run sync:zk
```
4. Configure the deployed contract address (after deploying — see below)
```bash
echo "VITE_CONTRACT_ADDRESS=<CONTRACT_ADDRESS>" > .env.local
```
5. Run the development server
```bash
npm run dev
```

## Run Tests
```
npm test
```

## CI/CD
- **Testing & Build Validation**: A GitHub Actions workflow automatically runs on every push and pull request to the `main` branch. It ensures that `npm test` and `npm run build` pass before any code is considered stable.
- **Deployment**: Vercel automatically deploys the frontend on every push to the `main` branch. The build pipeline securely bundles the Midnight Zero-Knowledge artifacts and contract addresses into the static application for production hosting.

## Product Proposal
See PROPOSAL.md
