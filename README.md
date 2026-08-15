# 🌑 ShadowDAO

> **Private governance on Midnight — vote with a Zero-Knowledge proof, never reveal your choice.**

---

## 🚀 Live Demo

- **Live app:** [https://shadow-dao-eight.vercel.app](https://shadow-dao-eight.vercel.app)
- **Repo:** [https://github.com/pranavpatil0666-ai/SHADOWDAO](https://github.com/pranavpatil0666-ai/SHADOWDAO)

---

## 📜 Contract Address

| Network | Address |
| :--- | :--- |
| **Preview** | `7145c6c7fe1b3bab9f25f5e6733f707f52f6d0edfca58add696f4301170b0f5d` |

---

## 💡 What This Does

ShadowDAO is a privacy-first decentralized autonomous organization. Members connect their Lace wallet, then vote **YES**, **NO**, or **ABSTAIN** on a proposal. 

The vote is sealed into a Zero-Knowledge commitment **locally in the browser** and submitted to a Compact smart contract on the Midnight Preview network. The chain only ever learns that a vote happened — the public `total_votes` counter increments — and never learns which option was chosen.

---

## 🔒 Privacy Model

- 👁️ **What is PUBLIC:** The contract's `total_votes` counter (the number of votes cast).
- 🕵️ **What is PRIVATE:** The individual choice (YES/NO/ABSTAIN) and the member's secret credential.
- 🛡️ **What the user PROVES without revealing:** That they cast a valid vote (a Zero-Knowledge proof is generated locally from a commitment over `{proposal_id, choice, member_secret}`). The choice and secret never appear in the UI, the network, or the ledger.

---

## ⚖️ Privacy Claim

An on-chain observer sees a `vote` circuit call and the public tally incrementing. They **cannot** see who voted, which option was chosen, or the member secret — only that a valid proof was produced and submitted.

---

## 🛠️ Tech Stack

- **Network:** Midnight
- **Language:** Compact
- **SDK:** Midnight.js SDK
- **Frontend:** React / Vite / Tailwind CSS
- **Wallet:** Lace
- **Hosting:** Vercel

---

## ⚙️ Prerequisites

- [Lace wallet](https://lace.io) extension installed, connected to **Midnight Preview**
- Node.js v22+
- Docker (only needed to run the local proof server during deployment)

---

## 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/pranavpatil0666-ai/SHADOWDAO.git
cd SHADOWDAO
```

### 2. Install dependencies

```bash
npm install
```

### 3. Sync the compiled ZK assets into `public/`

```bash
npm run sync:zk
```

### 4. Configure the deployed contract address

*(Do this after deploying — see below)*

```bash
echo "VITE_CONTRACT_ADDRESS=<CONTRACT_ADDRESS>" > .env.local
```

### 5. Run the development server

```bash
npm run dev
```

> **Note:** Open `http://localhost:5173`, click **Connect Wallet**, approve in Lace, then cast a vote. You'll see the loading state while the proof is generated locally, then the on-chain result.

---

## 🚢 Deploy the Contract (Preview)

### 1. Start the local proof server
```bash
docker compose up -d proof-server
```

### 2. Configure Wallet Seed
Create `.env` from the example and set your `WALLET_SEED`:
```bash
cp .env.example .env
```
> **Action:** Paste your Level 1 hex seed (64 chars) as `WALLET_SEED`. Fund the wallet's unshielded address from the [Preview faucet](https://midnight-tmnight-preview.nethermind.dev) if it has 0 tNIGHT.

### 3. Deploy
This prints the address and writes it to `.env.local` automatically:
```bash
npm run deploy:preview
```

> ⚠️ Copy the printed contract address into the **Contract Address** table above.

---

## 🌐 Deploy the Frontend (Vercel)

```bash
npm i -g vercel
vercel login
vercel --prod
```

The frontend connects to your contract at build time via `VITE_CONTRACT_ADDRESS`. Set it in the Vercel dashboard (`Project` → `Settings` → `Environment Variables`), then redeploy:

```bash
vercel env add VITE_CONTRACT_ADDRESS
vercel --prod
```

---

## 🎥 Demo Video

[PLACEHOLDER — I will add the link after recording]

---

## ✅ Recording Checklist

1. **Connect Lace wallet** — show the address appear on screen
2. **Cast a vote** — show the loading state during proof generation
3. **Show the on-chain result** (`txId` + public tally) after submission
4. **Highlight Privacy** — Point out that the private input (your choice) was never shown in the UI
