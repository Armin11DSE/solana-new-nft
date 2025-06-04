# 🖼️ Solana Devnet NFT

This project automates the lifecycle of creating and verifying NFTs on the Solana Devnet. It:

- Creates a verified NFT collection
- Mints NFT into that collection
- Verifies each NFT against the collection authority

⚠️ For development and testing only on Solana Devnet. No real value is associated.

---

🛠 Prerequisites

- Solana CLI: <https://docs.solana.com/cli/install-solana-cli>
- Node.js (v18+): <https://nodejs.org/>
- Internet connection

---

📁 Project Structure

.
├── src/
│ ├── create-collection.ts      # Creates a collection NFT
│ ├── create-nft.ts             # Mints an NFT into the collection
│ └── verify-nft.ts             # Verifies the NFT belongs to the collection
└── run.sh                      # Run script for full flow

---

🚀 Usage

1. Install dependencies

    npm install

2. Run the full NFT flow

    chmod +x run.sh
    ./run.sh

This script will:

- Create a collection NFT
- Mint a new NFT into that collection
- Verify the NFT

---
