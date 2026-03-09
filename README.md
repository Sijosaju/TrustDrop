<div align="center">

# ⬡ TrustDrop

### Blockchain-Powered Donation Tracker on Ethereum

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia_Testnet-3C3C3D?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/)
[![ethers.js](https://img.shields.io/badge/ethers.js-5.7.2-2535a0?style=for-the-badge)](https://docs.ethers.io/)
[![MetaMask](https://img.shields.io/badge/MetaMask-Compatible-E88831?style=for-the-badge&logo=metamask)](https://metamask.io/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

> **Every donation is immutably recorded on the Ethereum blockchain.**  
> Trust through transparency. Verified by cryptography. Powered by Web3.

<br/>

</div>

---

## 🌟 What is TrustDrop?

**TrustDrop** is a decentralized application (DApp) that brings radical transparency to charitable giving. Built on the Ethereum blockchain, every single donation is permanently recorded on-chain — visible to anyone, alterable by no one.

No middlemen. No hidden fees. No trust required.

The project consists of:
- 🔗 A **production-ready Solidity smart contract** with enterprise-grade security
- 🎨 A **stunning glassmorphic frontend** with animated particle canvas and live ETH pricing
- 🚀 **Vercel-hosted deployment** with hardened HTTP security headers

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 💸 **On-Chain Donations** | Send ETH donations with an optional personal message, permanently stored on Ethereum |
| 📜 **Live Donation History** | View the last 10 on-chain donations in real-time, paginated from the contract |
| 💱 **ETH ↔ Fiat Converter** | Live price feed (via CoinGecko) supporting INR, USD, EUR & GBP, auto-refreshing every 60s |
| 🦊 **MetaMask Integration** | One-click wallet connect with Jazzicon-style avatar generation |
| 🔐 **Owner Admin Panel** | Exclusive panel for the contract owner to withdraw funds and pause/unpause donations |
| 🌐 **Network Guard** | Automatically detects and prompts users to switch to the Sepolia Testnet |
| 📱 **Mobile Wallet Support** | Deep-link support for connecting MetaMask on mobile devices |
| 🛡️ **Hardened Security** | CSP headers, XSS protection, X-Frame-Options, and Referrer-Policy enforced |

---

## 🔒 Smart Contract — `DonationTracker.sol`

The smart contract is a **production-hardened** Solidity implementation deployed on Ethereum **Sepolia Testnet**.

**Contract Address:** `0xEB4F61aDA7D9DaC6240759fa0fdb0F461F1688D1`

### Security Architecture

The contract implements three critical security patterns from scratch (no external imports needed):

```
DonationTracker
├── ReentrancyGuard   — Prevents re-entrancy attacks on withdraw()
├── Pausable          — Emergency stop mechanism to halt donations
└── onlyOwner         — Access control for privileged admin actions
```

### Contract Functions

#### 🟢 Public Functions (anyone can call)
| Function | Description |
|---|---|
| `donate(string message)` | Send ETH donation with an optional message (min: 0.001 ETH, max message: 200 chars) |
| `getDonationCount()` | Returns the total number of donations recorded |
| `getDonation(uint256 index)` | Returns a single donation (donor, amount, timestamp, message) |
| `getDonations(uint256 from, uint256 count)` | Paginated bulk fetch of donations |
| `getTotalAmountRaised()` | Returns the cumulative ETH raised all-time |
| `getTotalBalance()` | Returns the current contract ETH balance |

#### 🔴 Owner-Only Functions (restricted)
| Function | Description |
|---|---|
| `withdraw()` | Withdraw the full contract balance to the owner's wallet |
| `pause()` | Pause all donations (emergency stop) |
| `unpause()` | Resume donations |
| `setMinimumDonation(uint256)` | Update the minimum donation threshold |
| `transferOwnership(address)` | Transfer contract control to a new address |

### Events Emitted
```solidity
event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp, string message);
event Withdrawn(address indexed owner, uint256 amount, uint256 timestamp);
event MinimumDonationUpdated(uint256 newMinimum);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

---

## 🎨 Frontend Architecture

The frontend is a single-page application built with **vanilla HTML, CSS, and JavaScript** — zero frameworks, maximum performance.

```
DonationDApp/
├── index.html          # Semantic HTML5, CSP meta, Google Fonts
├── style.css           # Full glassmorphism design system + animations
├── app.js              # Web3 logic, contract interaction, ETH converter
├── DonationTracker.sol # Solidity smart contract (source of truth)
└── vercel.json         # Deployment config + security headers
```

### Design Highlights
- 🌌 **Animated particle canvas** — 120 floating particles with connection lines
- 💎 **Glassmorphism cards** — backdrop-blur, gradient glows, subtle borders
- 🔄 **Animated 2D blockchain graphic** — live block propagation visualization
- ✨ **Micro-animations** — hover states, shimmer buttons, spin transitions
- 🎯 **Quick-amount buttons** — 0.001 / 0.01 / 0.05 / 0.1 ETH presets
- 🖥️ **Fully responsive** — optimized for desktop and mobile viewports

---

## 🚀 Getting Started

### Prerequisites
- [MetaMask](https://metamask.io/) browser extension installed
- Sepolia testnet ETH (get free test ETH from [Sepolia Faucet](https://sepoliafaucet.com/))

### Using the DApp

1. **Visit the live app** → *(your Vercel URL here)*
2. **Connect Wallet** — Click the 🦊 button and approve MetaMask
3. **Switch to Sepolia** — The app will prompt you if you're on the wrong network
4. **Enter an amount** — Use quick-amount buttons or type manually
5. **Add a message** — Optional (up to 200 characters)
6. **Click "Donate Now"** — Confirm the transaction in MetaMask
7. **Track it live** — Your donation appears in the history feed on-chain

### Running Locally

```bash
# Clone the repository
git clone https://github.com/Sijosaju/TrustDrop.git
cd TrustDrop

# No build step needed — it's pure HTML/CSS/JS!
# Simply open index.html in your browser, or serve it:
npx serve .

# Then visit http://localhost:3000
```

### Deploying Your Own Contract (Remix IDE)

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create a new file, paste the contents of `DonationTracker.sol`
3. Compile with Solidity `^0.8.20`
4. Deploy to **Sepolia Testnet** via **Injected Provider (MetaMask)**
5. Copy the deployed contract address
6. Update `CONTRACT_ADDRESS` in `app.js`:

```javascript
const CONTRACT_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS";
```

---

## 🔐 Security Considerations

| Threat | Mitigation |
|---|---|
| **Re-entrancy Attack** | Custom `ReentrancyGuard` wraps `withdraw()` and `donate()` |
| **Unauthorized Access** | `onlyOwner` modifier on all admin functions |
| **Contract Abuse** | `Pausable` pattern allows emergency shutdown |
| **XSS via Donor Messages** | `escapeHtml()` sanitizes all user-generated content before DOM insertion |
| **Clickjacking** | `X-Frame-Options: DENY` set via Vercel headers |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` enforced |
| **Content Injection** | Strict Content Security Policy (CSP) on `script-src`, `connect-src` |
| **Network Manipulation** | Chain ID check (`0xaa36a7`) prevents wrong-network transactions |

---

## 🌐 Deployment

The app is deployed as a **static site on Vercel** with zero build configuration.

**`vercel.json`** configures:
- Static output served from the root directory
- All routes rewritten to `index.html` (SPA routing)
- Security headers on every response

```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

To deploy your own fork:
```bash
npm install -g vercel
vercel --prod
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | Ethereum (Sepolia Testnet) |
| **Smart Contract** | Solidity `^0.8.20` |
| **Web3 Library** | ethers.js v5.7.2 (CDN) |
| **Wallet** | MetaMask (EIP-1193 provider) |
| **Price Oracle** | CoinGecko Public API |
| **Frontend** | Vanilla HTML5 + CSS3 + ES2022 JavaScript |
| **Fonts** | Inter + Space Grotesk (Google Fonts) |
| **Hosting** | Vercel (static deployment) |
| **Block Explorer** | Sepolia Etherscan |

---

## 📊 Contract Stats

| Parameter | Value |
|---|---|
| **Network** | Ethereum Sepolia Testnet |
| **Compiler** | Solidity `^0.8.20` |
| **License** | MIT |
| **Minimum Donation** | 0.001 ETH |
| **Max Message Length** | 200 characters |
| **Re-entrancy Protected** | ✅ Yes |
| **Emergency Pause** | ✅ Yes |
| **Ownership Transferable** | ✅ Yes |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ on Ethereum**

*Every donation. Every donor. Forever on-chain.*

⬡ [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xEB4F61aDA7D9DaC6240759fa0fdb0F461F1688D1) · 🦊 [Get MetaMask](https://metamask.io/) · ⛽ [Sepolia Faucet](https://sepoliafaucet.com/)

</div>
