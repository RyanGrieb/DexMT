# DEXMT (In Development)

[![Tests](https://github.com/RyanGrieb/DexMT/actions/workflows/main.yml/badge.svg)](https://github.com/RyanGrieb/DexMT/actions)

Decentralized Exchange Mirror Trading Platform

---

### ❓ About

DEXMT is a platform that enables users to copy trades of top DeFi performers automatically.

(Currently we rely on the GMX SDK, we need to reference smart contracts on-chain in the future)

---

### ✨ Features

- **Auto Mirror Trading**: Automatically replicate trades from top-performing DeFi wallets.
- **Real-Time Analytics**: Gain insights into trading performance and market trends.
- **Risk Management Settings**: Customize risk parameters to suit your trading strategy.
- **Non-Custodial**: Maintain full control of your funds with wallet-based authentication.
- **Multi-Platform**: Supports GMX, dYdX, and Hyperliquid for decentralized trading.

> **Note:** These features are currently under development and may not be fully functional yet.

---

### 🛠️ Tech Stack

- Backend: Hono.js (TypeScript) + PostgreSQL
- Frontend: Vanilla TypeScript + Modern CSS
- Blockchain: GMX SDK integration for decentralized trading
- DevOps: Docker containerization
- Authentication: MetaMask wallet integration with signature verification

---

### 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/DEXMT-Docker.git
   ```

2. **Enter the project folder**

   ```bash
   cd DEXMT-Docker
   ```

3. **Launch services**

   ```bash
   docker compose up -d
   ```

4. **Open the app**  
   Visit http://localhost:8787 in your browser

🧪 Test Options:

# Unit tests only (fast, no Docker needed)

npm test

# Integration tests with Docker (full setup)

npm run test:integration

# Quick integration tests (assumes server running)

npm run test:integration:quick

# All tests

npm run test:all

---

### ⚠️ Disclaimer

DEXMT is an early-stage, experimental project provided “as is.”  
Use the platform at your own risk—this is not financial or investment advice.  
Always conduct your own research before copying any trades.  
We make no guarantees about performance, security, or uptime.  
We are not liable for any losses, damages, or unintended behavior.  
If you’re new to DeFi, consider testing with small amounts or on a forked/testnet environment first.

---

### 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
