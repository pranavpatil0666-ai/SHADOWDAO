# ShadowDAO

> Private governance on Midnight — vote with a Zero-Knowledge proof, never reveal your choice.

## Live Demo

[PASTE LIVE URL AFTER DEPLOYING FRONTEND]

## Contract Address

| Network | Address |
|---------|---------|
| Preview | `196bc55942024cc10a59c2f31bdc3d28eb9545828f8123576642e36d84bdea1e` |

## What This Does

ShadowDAO is a privacy-first decentralized autonomous organization. Members connect their Lace wallet, then vote YES / NO / ABSTAIN on a proposal. The vote is sealed into a Zero-Knowledge commitment **locally in the browser** and submitted to a Compact smart contract on the Midnight Preview network. The chain only ever learns that a vote happened — the public `total_votes` counter increments — and never learns which option was chosen.

## Privacy Model

- **What is PUBLIC:** The contract's `total_votes` counter (the number of votes cast).
- **What is PRIVATE:** The individual choice (YES/NO/ABSTAIN) and the member's secret credential.
- **What the user PROVES without revealing:** That they cast a valid vote (a Zero-Knowledge proof is generated locally from a commitment over `{proposal_id, choice, member_secret}`). The choice and secret never appear in the UI, the network, or the ledger.

## Privacy Claim

An on-chain observer sees a `vote` circuit call and the public tally incrementing. They **cannot** see who voted, which option was chosen, or the member secret — only that a valid proof was produced and submitted.

## Tech Stack

Midnight network, Compact, Midnight.js SDK, React/Vite, Lace wallet, Tailwind CSS, Vercel.

## Prerequisites

- [Lace wallet](https://lace.io) extension installed, connected to **Midnight Preview**
- Node.js v22+
- Docker (only needed to run the local proof server during deployment)

## Run Locally

1. Clone the repository

```bash
git clone <repo-url>
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

Open `http://localhost:5173`, click **Connect Wallet**, approve in Lace, then cast a vote. You'll see the loading state while the proof is generated locally, then the on-chain result.

## Deploy the Contract (Preview)

```bash
# 1. Start the local proof server
docker compose up -d proof-server

# 2. Create .env from the example and set your WALLET_SEED
cp .env.example .env
#    → paste your Level 1 hex seed (64 chars) as WALLET_SEED
#    → fund the wallet's unshielded address from the Preview faucet if it has 0 tNIGHT
#      https://midnight-tmnight-preview.nethermind.dev

# 3. Deploy — prints the address and writes it to .env.local automatically
npm run deploy:preview
```

Copy the printed contract address into the **Contract Address** table above.

## Deploy the Frontend (Vercel)

```bash
npm i -g vercel
vercel login
vercel --prod
```

The frontend connects to your contract at build time via `VITE_CONTRACT_ADDRESS`. Set it in the Vercel dashboard (Project → Settings → Environment Variables), then redeploy:

```bash
vercel env add VITE_CONTRACT_ADDRESS
vercel --prod
```

## Demo Video

[PLACEHOLDER — I will add the link after recording]

## Recording Checklist

1. Connect Lace wallet — show the address appear on screen
2. Cast a vote — show the loading state during proof generation
3. Show the on-chain result (txId + public tally) after submission
4. Point out that the private input (your choice) was never shown
