// ==========================================
// CONTRACT CONFIG — UPDATE AFTER REDEPLOYMENT
// ==========================================
const CONTRACT_ADDRESS = "0xEB4F61aDA7D9DaC6240759fa0fdb0F461F1688D1"; // ← Replace after redeploying
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

// Updated ABI to match new DonationTracker.sol
const CONTRACT_ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "donor", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "indexed": false, "internalType": "string", "name": "message", "type": "string" }
        ],
        "name": "DonationReceived", "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "Withdrawn", "type": "event"
    },
    { "inputs": [{ "internalType": "string", "name": "message", "type": "string" }], "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "newMinimum", "type": "uint256" }], "name": "setMinimumDonation", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "getDonationCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getTotalBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getTotalAmountRaised", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "minimumDonation", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "paused", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    {
        "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
        "name": "getDonation",
        "outputs": [
            { "internalType": "address", "name": "donor", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "internalType": "string", "name": "message", "type": "string" }
        ],
        "stateMutability": "view", "type": "function"
    }
];

// ==========================================
// GLOBALS
// ==========================================
let provider, signer, contract;
let walletAddress = null;
let isOwner = false;
let contractIsPaused = false;

// ==========================================
// PARTICLE CANVAS BACKGROUND
// ==========================================
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: ['59,130,246', '139,92,246', '236,72,153', '6,182,212'][Math.floor(Math.random() * 4)]
    };
}

for (let i = 0; i < 120; i++) particles.push(createParticle());

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();

        particles.forEach((p2, j) => {
            if (i === j) return;
            const dx = p.x - p2.x, dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(${p.color},${(1 - dist / 100) * 0.15})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
    });
    requestAnimationFrame(drawParticles);
}
drawParticles();

// ==========================================
// DONOR MESSAGE CHARACTER COUNTER
// ==========================================
const msgTextarea = document.getElementById('donate-message');
if (msgTextarea) {
    msgTextarea.addEventListener('input', () => {
        document.getElementById('char-count').textContent = msgTextarea.value.length;
    });
}

function bindUiEvents() {
    const switchNetworkBtn = document.getElementById('switch-network-btn');
    if (switchNetworkBtn) switchNetworkBtn.addEventListener('click', switchToSepolia);

    const connectBtn = document.getElementById('connect-btn');
    if (connectBtn) connectBtn.addEventListener('click', connectWallet);

    const donateBtn = document.getElementById('donate-btn');
    if (donateBtn) donateBtn.addEventListener('click', donate);

    const historyRefreshBtn = document.getElementById('history-refresh-btn');
    if (historyRefreshBtn) historyRefreshBtn.addEventListener('click', loadHistory);

    const withdrawBtn = document.getElementById('withdraw-btn');
    if (withdrawBtn) withdrawBtn.addEventListener('click', withdrawFunds);

    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

    const priceRefreshBtn = document.getElementById('price-refresh-btn');
    if (priceRefreshBtn) priceRefreshBtn.addEventListener('click', fetchEthPrice);

    const convSwapBtn = document.getElementById('conv-swap-btn');
    if (convSwapBtn) convSwapBtn.addEventListener('click', swapConverter);

    const useAmountBtn = document.getElementById('use-converter-amount-btn');
    if (useAmountBtn) useAmountBtn.addEventListener('click', useConverterAmount);

    const ethInput = document.getElementById('conv-eth');
    if (ethInput) {
        ethInput.addEventListener('input', (event) => convertFromEth(event.target.value));
    }

    const fiatInput = document.getElementById('conv-fiat');
    if (fiatInput) {
        fiatInput.addEventListener('input', (event) => convertFromFiat(event.target.value));
    }

    document.querySelectorAll('[data-quick-amount]').forEach((btn) => {
        btn.addEventListener('click', () => setAmount(btn.dataset.quickAmount));
    });

    document.querySelectorAll('.cur-tab[data-currency]').forEach((btn) => {
        btn.addEventListener('click', () => selectCurrency(btn.dataset.currency, btn));
    });
}

// ==========================================
// NETWORK GUARD — Sepolia Only
// ==========================================
async function checkNetwork() {
    if (!provider) return;
    const network = await provider.getNetwork();
    const chainIdHex = "0x" + network.chainId.toString(16);
    const warningEl = document.getElementById('network-warning');
    if (chainIdHex !== SEPOLIA_CHAIN_ID) {
        warningEl.style.display = 'flex';
        return false;
    }
    warningEl.style.display = 'none';
    return true;
}

async function switchToSepolia() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }]
        });
    } catch (err) {
        if (err.code === 4902) {
            // Sepolia not in wallet — add it
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: SEPOLIA_CHAIN_ID,
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: ['https://rpc.sepolia.org'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
            });
        } else {
            showToast('❌ Could not switch network: ' + err.message, 'error');
        }
    }
}

// ==========================================
// CONNECT WALLET
// ==========================================
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showToast('❌ MetaMask not found! Please install it.', 'error');
        return;
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        walletAddress = await signer.getAddress();

        // Network check — must be Sepolia
        const onCorrectNetwork = await checkNetwork();
        if (!onCorrectNetwork) {
            showToast('⚠️ Please switch to Sepolia Testnet to use this DApp.', 'warn');
        }

        const network = await provider.getNetwork();
        const balance = await provider.getBalance(walletAddress);
        const ethBalance = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);

        // Update navbar
        const networkBadge = document.getElementById('network-badge');
        const networkName = document.getElementById('network-name');
        networkName.textContent = network.name === 'unknown' ? 'Sepolia' : network.name;
        networkBadge.querySelector('.dot').classList.add('connected');

        const btn = document.getElementById('connect-btn');
        btn.innerHTML = `<span class="btn-icon">✅</span> ${shortAddr(walletAddress)}`;
        btn.disabled = true;

        // Show wallet info in hero
        const walletInfo = document.getElementById('wallet-info');
        walletInfo.classList.add('visible');
        document.getElementById('wallet-address').textContent = shortAddr(walletAddress);
        document.getElementById('wallet-balance').textContent = `${ethBalance} ETH`;

        // Jazzicon-style avatar
        const avatar = document.getElementById('wallet-avatar');
        const seed = parseInt(walletAddress.slice(2, 10), 16);
        const hue1 = seed % 360, hue2 = (seed + 120) % 360;
        avatar.style.background = `linear-gradient(135deg, hsl(${hue1},80%,60%), hsl(${hue2},80%,50%))`;

        // Init contract
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Check if connected wallet is the owner
        const ownerAddr = await contract.owner();
        isOwner = ownerAddr.toLowerCase() === walletAddress.toLowerCase();

        if (isOwner) {
            document.getElementById('admin-panel').style.display = 'block';
            await loadAdminStats();
        }

        // Load data
        await loadStats();
        await loadHistory();

        showToast('✅ Wallet connected successfully!');

        // Listen for changes
        window.ethereum.on('accountsChanged', () => window.location.reload());
        window.ethereum.on('chainChanged', () => window.location.reload());

    } catch (err) {
        console.error(err);
        showToast('❌ ' + friendlyError(err), 'error');
    }
}

// ==========================================
// SET QUICK AMOUNT
// ==========================================
function setAmount(val) {
    document.getElementById('donate-amount').value = val;
}

// ==========================================
// DONATE
// ==========================================
async function donate() {
    if (!contract) {
        showToast('🦊 Please connect your MetaMask wallet first!', 'warn');
        return;
    }

    const amountInput = document.getElementById('donate-amount').value;
    const message = (document.getElementById('donate-message').value || '').trim();

    if (!amountInput || parseFloat(amountInput) <= 0) {
        showToast('\u26a0\ufe0f Please enter a valid donation amount.', 'warn');
        return;
    }
    // Reject exponential notation like 1e10
    if (!/^\d*\.?\d+$/.test(amountInput)) {
        showToast('\u26a0\ufe0f Invalid amount format.', 'warn');
        return;
    }
    if (parseFloat(amountInput) < 0.001) {
        showToast('⚠️ Minimum donation is 0.001 ETH.', 'warn');
        return;
    }
    if (message.length > 200) {
        showToast('⚠️ Message must be 200 characters or less.', 'warn');
        return;
    }

    // Network guard before transaction
    const onCorrectNetwork = await checkNetwork();
    if (!onCorrectNetwork) {
        showToast('⚠️ Switch to Sepolia Testnet first!', 'warn');
        return;
    }

    const statusDiv = document.getElementById('tx-status');
    const txIcon = document.getElementById('tx-icon');
    const txTitle = document.getElementById('tx-title');
    const txHash = document.getElementById('tx-hash');
    const donateBtn = document.getElementById('donate-btn');

    statusDiv.style.display = 'flex';
    txIcon.textContent = '⏳';
    txIcon.classList.remove('done');
    txIcon.style.animation = 'spinIcon 1s linear infinite';
    txTitle.textContent = 'Waiting for MetaMask confirmation...';
    txTitle.style.color = '';
    txHash.innerHTML = '';
    donateBtn.disabled = true;

    try {
        const tx = await contract.donate(message, {
            value: ethers.utils.parseEther(amountInput)
        });

        txTitle.textContent = 'Transaction submitted — mining...';
        // Safe external link — no innerHTML with external data
        const txLink = document.createElement('a');
        txLink.href = `https://sepolia.etherscan.io/tx/${tx.hash}`;
        txLink.target = '_blank';
        txLink.rel = 'noopener noreferrer';
        txLink.textContent = shortHash(tx.hash) + ' \u2197';
        txHash.innerHTML = '';
        txHash.appendChild(txLink);

        await tx.wait();

        txIcon.textContent = '✅';
        txIcon.classList.add('done');
        txIcon.style.animation = 'none';
        txTitle.textContent = 'Donation confirmed on blockchain!';
        txTitle.style.color = '#10b981';

        document.getElementById('donate-amount').value = '';
        document.getElementById('donate-message').value = '';
        document.getElementById('char-count').textContent = '0';
        showToast('🎉 Donation successful! Recorded on Ethereum.', 'success');

        await loadStats();
        await loadHistory();
        if (isOwner) await loadAdminStats();

    } catch (err) {
        console.error(err);
        txIcon.textContent = '❌';
        txIcon.classList.add('done');
        txIcon.style.animation = 'none';
        txTitle.textContent = friendlyError(err);
        txTitle.style.color = '#ef4444';
        showToast('❌ Transaction failed.', 'error');
    } finally {
        donateBtn.disabled = false;
    }
}

// ==========================================
// ADMIN — WITHDRAW FUNDS
// ==========================================
async function withdrawFunds() {
    if (!contract || !isOwner) return;

    const balance = await contract.getTotalBalance();
    if (balance.isZero()) {
        showToast('⚠️ No funds to withdraw.', 'warn');
        return;
    }

    setAdminTxUI('⏳', 'Waiting for MetaMask confirmation...', '', true);

    try {
        const tx = await contract.withdraw();
        const adminLink = document.createElement('a');
        adminLink.href = `https://sepolia.etherscan.io/tx/${tx.hash}`;
        adminLink.target = '_blank';
        adminLink.rel = 'noopener noreferrer';
        adminLink.textContent = shortHash(tx.hash) + ' \u2197';
        setAdminTxUI('\u23f3', 'Withdraw submitted \u2014 mining...', adminLink.outerHTML, true);
        await tx.wait();
        setAdminTxUI('✅', 'Withdrawal successful! ETH sent to your wallet.', '', false);
        showToast('💸 Funds withdrawn successfully!', 'success');
        await loadStats();
        await loadAdminStats();
    } catch (err) {
        console.error(err);
        setAdminTxUI('❌', friendlyError(err), '', false);
        showToast('❌ Withdrawal failed.', 'error');
    }
}

// ==========================================
// ADMIN — PAUSE / UNPAUSE
// ==========================================
async function togglePause() {
    if (!contract || !isOwner) return;

    setAdminTxUI('⏳', contractIsPaused ? 'Unpausing...' : 'Pausing...', '', true);
    try {
        const tx = contractIsPaused ? await contract.unpause() : await contract.pause();
        await tx.wait();
        contractIsPaused = !contractIsPaused;
        updatePauseButton();
        setAdminTxUI(contractIsPaused ? '⏸' : '▶️', contractIsPaused ? 'Contract paused. Donations stopped.' : 'Contract unpaused. Donations live!', '', false);
        showToast(contractIsPaused ? '⏸ Donations paused.' : '▶️ Donations resumed.', 'warn');
    } catch (err) {
        console.error(err);
        setAdminTxUI('❌', friendlyError(err), '', false);
    }
}

function updatePauseButton() {
    document.getElementById('pause-icon').textContent = contractIsPaused ? '▶️' : '⏸';
    document.getElementById('pause-label').textContent = contractIsPaused ? 'Resume Donations' : 'Pause Donations';
    document.getElementById('pause-btn').style.borderColor = contractIsPaused ? 'rgba(16,185,129,0.4)' : '';
}

function setAdminTxUI(icon, title, hashHtml, spinning) {
    const el = document.getElementById('admin-tx-status');
    el.style.display = 'flex';
    document.getElementById('admin-tx-icon').textContent = icon;
    document.getElementById('admin-tx-icon').style.animation = spinning ? 'spinIcon 1s linear infinite' : 'none';
    document.getElementById('admin-tx-title').textContent = title;
    document.getElementById('admin-tx-hash').innerHTML = hashHtml;
    document.getElementById('withdraw-btn').disabled = spinning;
    document.getElementById('pause-btn').disabled = spinning;
}

// ==========================================
// ADMIN STATS
// ==========================================
async function loadAdminStats() {
    if (!contract || !isOwner) return;
    try {
        const balance = await contract.getTotalBalance();
        const raised = await contract.getTotalAmountRaised();
        contractIsPaused = await contract.paused();

        document.getElementById('admin-balance').textContent =
            parseFloat(ethers.utils.formatEther(balance)).toFixed(4) + ' ETH';
        document.getElementById('admin-total-raised').textContent =
            parseFloat(ethers.utils.formatEther(raised)).toFixed(4) + ' ETH';

        updatePauseButton();
    } catch (err) {
        console.error('Admin stats error:', err);
    }
}

// ==========================================
// LOAD PUBLIC STATS
// ==========================================
async function loadStats() {
    if (!contract) return;
    try {
        const count = await contract.getDonationCount();
        const balance = await contract.getTotalBalance();
        animateCounter('stat-count', parseInt(count.toString()));
        animateValue('stat-balance', parseFloat(ethers.utils.formatEther(balance)).toFixed(4));
    } catch (err) {
        console.error('Stats error:', err);
    }
}

function animateCounter(id, target) {
    let start = 0;
    const el = document.getElementById(id);
    const step = Math.ceil(target / 20) || 1;
    const timer = setInterval(() => {
        start = Math.min(start + step, target);
        el.textContent = start;
        if (start >= target) clearInterval(timer);
    }, 40);
}

function animateValue(id, target) {
    document.getElementById(id).textContent = target;
}

// ==========================================
// LOAD DONATION HISTORY
// ==========================================
async function loadHistory() {
    if (!contract) return;

    const listEl = document.getElementById('donation-list');
    listEl.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const count = await contract.getDonationCount();
        const total = parseInt(count.toString());

        if (total === 0) {
            listEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🌱</div>
          <p>No donations yet. Be the first donor!</p>
        </div>`;
            return;
        }

        listEl.innerHTML = '';
        const limit = Math.min(total, 10);
        for (let i = total - 1; i >= total - limit; i--) {
            const [donor, amount, timestamp, message] = await contract.getDonation(i);
            const ethAmt = parseFloat(ethers.utils.formatEther(amount)).toFixed(4);
            const date = new Date(timestamp.toNumber() * 1000).toLocaleString();

            const seed = parseInt(donor.slice(2, 10), 16);
            const h1 = seed % 360, h2 = (seed + 120) % 360;
            const gradient = `linear-gradient(135deg, hsl(${h1},80%,60%), hsl(${h2},80%,50%))`;

            const div = document.createElement('div');
            div.className = 'donation-item';
            div.style.animationDelay = `${(total - 1 - i) * 0.05}s`;
            div.innerHTML = `
        <div class="donation-avatar" style="background:${gradient}"></div>
        <div class="donation-info">
          <div class="donation-addr">${shortAddr(donor)}</div>
          <div class="donation-time">\uD83D\uDD50 ${date}</div>
          ${message ? `<div class="donation-msg">"${escapeHtml(message)}"</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
          <span class="donation-amount">+${ethAmt} ETH</span>
          <a class="donation-etherscan"
             href="https://sepolia.etherscan.io/address/${donor}"
             target="_blank"
             rel="noopener noreferrer">Etherscan \u2197</a>
        </div>
      `;
            listEl.appendChild(div);
        }
    } catch (err) {
        listEl.innerHTML = `<div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <p style="color:#ef4444">Failed to load history: ${err.message}</p>
    </div>`;
        console.error(err);
    }
}

// ==========================================
// FRIENDLY ERROR MESSAGES
// ==========================================
function friendlyError(err) {
    if (err.code === 4001) return 'Transaction rejected by user.';
    if (err.code === -32603) return 'Insufficient ETH balance.';
    if (err.code === 'INSUFFICIENT_FUNDS') return 'Insufficient ETH balance.';
    if (err.code === 'UNPREDICTABLE_GAS_LIMIT') return 'Transaction would fail — check contract state.';
    if (err.reason) return err.reason;
    if (err.message && err.message.includes('Donation below minimum')) return 'Donation is below the minimum 0.001 ETH.';
    if (err.message && err.message.includes('Contract is paused')) return 'Donations are paused by the organization.';
    if (err.message && err.message.includes('No funds')) return 'No funds available to withdraw.';
    return err.message || 'Unknown error occurred.';
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.borderColor = type === 'error' ? 'rgba(239,68,68,0.4)'
        : type === 'warn' ? 'rgba(245,158,11,0.4)'
            : type === 'success' ? 'rgba(16,185,129,0.4)'
                : 'rgba(255,255,255,0.08)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ==========================================
// HELPERS
// ==========================================
function shortAddr(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function shortHash(hash) {
    return hash.slice(0, 10) + '...' + hash.slice(-6);
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ==========================================
// ETH ↔ CURRENCY CONVERTER
// ==========================================
const ETH_PRICES = { inr: 0, usd: 0, eur: 0, gbp: 0 };
let selectedCurrency = 'inr';

async function fetchEthPrice() {
    const badge = document.getElementById('eth-usd-display');
    const updatedEl = document.getElementById('price-updated');
    badge.textContent = 'Updating...';
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr,usd,eur,gbp'
        );
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        ETH_PRICES.inr = data.ethereum.inr;
        ETH_PRICES.usd = data.ethereum.usd;
        ETH_PRICES.eur = data.ethereum.eur;
        ETH_PRICES.gbp = data.ethereum.gbp;
        updatePriceBadge();
        const now = new Date();
        updatedEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        const ethVal = document.getElementById('conv-eth').value;
        if (ethVal) convertFromEth(ethVal);
    } catch (err) {
        badge.textContent = 'Price unavailable';
        updatedEl.textContent = 'Could not fetch price.';
        console.error('Price fetch error:', err);
    }
}

function updatePriceBadge() {
    const symbols = { inr: '₹', usd: '$', eur: '€', gbp: '£' };
    const price = ETH_PRICES[selectedCurrency];
    const sym = symbols[selectedCurrency];
    document.getElementById('eth-usd-display').textContent = `1 ETH = ${sym}${price.toLocaleString()}`;
}

function selectCurrency(currency, btn) {
    selectedCurrency = currency;
    document.querySelectorAll('.cur-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const labels = { inr: 'INR', usd: 'USD', eur: 'EUR', gbp: 'GBP' };
    document.getElementById('conv-fiat-label').textContent = labels[currency] + ' Amount';
    document.getElementById('conv-fiat-tag').textContent = labels[currency];
    updatePriceBadge();
    const ethVal = document.getElementById('conv-eth').value;
    if (ethVal) convertFromEth(ethVal);
}

function convertFromEth(ethVal) {
    const rate = ETH_PRICES[selectedCurrency];
    if (!rate) return;
    const fiatVal = parseFloat(ethVal) * rate;
    document.getElementById('conv-fiat').value = isNaN(fiatVal) ? '' : fiatVal.toFixed(2);
}

function convertFromFiat(fiatVal) {
    const rate = ETH_PRICES[selectedCurrency];
    if (!rate) return;
    const ethVal = parseFloat(fiatVal) / rate;
    document.getElementById('conv-eth').value = isNaN(ethVal) ? '' : ethVal.toFixed(6);
}

function swapConverter() {
    const fiatInput = document.getElementById('conv-fiat');
    if (fiatInput.value) convertFromFiat(fiatInput.value);
    else convertFromEth(document.getElementById('conv-eth').value);
}

function useConverterAmount() {
    const ethVal = document.getElementById('conv-eth').value;
    if (!ethVal || parseFloat(ethVal) <= 0) {
        showToast('⚠️ Enter an ETH amount in the converter first.', 'warn');
        return;
    }
    document.getElementById('donate-amount').value = parseFloat(ethVal).toFixed(6);
    document.getElementById('donate-amount').scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast(`✅ Set donation to ${parseFloat(ethVal).toFixed(6)} ETH`);
}

// Fetch price on load, refresh every 60s
bindUiEvents();
fetchEthPrice();
setInterval(fetchEthPrice, 60000);
