// Firebase Configuration - Your actual config
const firebaseConfig = {
    apiKey: "AIzaSyBF14U4jZOg4wGe0F9VRE6YZx-BEgYlH2Q",
    authDomain: "blockchain-simulation-game.firebaseapp.com",
    databaseURL: "https://blockchain-simulation-game-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "blockchain-simulation-game",
    storageBucket: "blockchain-simulation-game.firebasestorage.app",
    messagingSenderId: "834318405949",
    appId: "1:834318405949:web:fb533091374f22ea1d7554"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

class BlockchainGame {
    constructor() {
        this.player = null;
        this.blockchain = [];
        this.transactionPool = [];
        this.selectedTransactions = [];
        this.currentNonce = 0;
        this.difficulty = 5;
        this.blockHeight = 1;
        this.players = new Map();
        this.isAutoMining = false;
        this.maxBlockSize = 5;
        this.currentBlockTimestamp = null; // Fixed timestamp for current mining session
        this.sessionId = null;
        this.userRole = null; // 'instructor' or 'student'
        this.maxParticipants = 80; // Increased from 50
        this.firebaseListeners = []; // Track Firebase listeners for cleanup
        
        this.setupEventListeners();
        this.initializeBlockchain(); // Only initialize blockchain, not the display
    }

    initializeBlockchain() {
        // Create genesis block
        const genesisBlock = {
            index: 0,
            timestamp: Date.now(),
            transactions: [],
            previousHash: '0',
            hash: '000000genesis',
            nonce: 0,
            miner: 'Genesis'
        };
        this.blockchain.push(genesisBlock);
        
        // Generate initial transactions
        this.generateTransactions();
    }

    initializeGame() {
        // Initialize the game display after user joins
        this.updateDisplay();
    }

    setupEventListeners() {
        // Role selection listeners
        document.getElementById('instructorRoleBtn').addEventListener('click', () => this.showInstructorSetup());
        document.getElementById('studentRoleBtn').addEventListener('click', () => this.showStudentJoin());
        
        // Navigation listeners
        document.getElementById('backToRoleBtn').addEventListener('click', () => this.showRoleSelection());
        document.getElementById('backToRoleFromStudentBtn').addEventListener('click', () => this.showRoleSelection());
        
        // Form submission listeners
        document.getElementById('instructorSetupForm').addEventListener('submit', (e) => this.handleInstructorSetup(e));
        document.getElementById('studentJoinForm').addEventListener('submit', (e) => this.handleStudentJoin(e));
        
        document.getElementById('incrementNonce').addEventListener('click', () => this.incrementNonce());
        document.getElementById('prepareBlockBtn').addEventListener('click', () => this.prepareBlock());
        document.getElementById('autoMineBtn').addEventListener('click', () => this.toggleAutoMine());
        document.getElementById('submitBlockBtn').addEventListener('click', () => this.submitBlock());
        document.getElementById('nonceInput').addEventListener('input', () => this.calculateHash());
        document.getElementById('updateDifficultyBtn').addEventListener('click', () => this.updateDifficulty());
        
        // Instructions modal
        document.getElementById('instructionsBtn').addEventListener('click', () => this.showInstructions());
        document.getElementById('closeInstructionsBtn').addEventListener('click', () => this.hideInstructions());
        
        // Add transaction modal
        document.getElementById('addTransactionBtn').addEventListener('click', () => this.showAddTransactionModal());
        document.getElementById('closeAddTransactionBtn').addEventListener('click', () => this.hideAddTransactionModal());
        document.getElementById('cancelTransactionBtn').addEventListener('click', () => this.hideAddTransactionModal());
        document.getElementById('addTransactionForm').addEventListener('submit', (e) => this.handleAddTransaction(e));
        
        // Close modals when clicking outside
        document.getElementById('instructionsModal').addEventListener('click', (e) => {
            if (e.target.id === 'instructionsModal') this.hideInstructions();
        });
        document.getElementById('addTransactionModal').addEventListener('click', (e) => {
            if (e.target.id === 'addTransactionModal') this.hideAddTransactionModal();
        });
    }

    joinGame() {
        const username = document.getElementById('usernameInput').value.trim();
        if (!username) {
            this.showNotification('Please enter a username', 'error');
            return;
        }

        // Check if username already exists
        if (this.players.has(username)) {
            this.showNotification('Username already taken! Please choose a different name.', 'error');
            return;
        }

        // Check if we've reached the 80 player limit
        if (this.players.size >= this.maxParticipants) {
            this.showNotification(`Mining pool is full! Maximum ${this.maxParticipants} miners allowed.`, 'error');
            return;
        }

        this.player = {
            name: username,
            score: 0,
            blocksMinedCount: 0,
            transactionsMinedCount: 0,
            totalFeesEarned: 0,
            joinTime: Date.now()
        };

        this.players.set(username, this.player);
        
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('playerName').textContent = username;
        
        this.initializeGame(); // Now initialize the game display
        this.showNotification(`Welcome to the mining pool, ${username}! (${this.players.size}/${this.maxParticipants} miners)`, 'success');
        this.showNotification('🎯 Mine blocks with 5 transactions each. Compete for the highest transaction fees!', 'info');
    }

    generateTransactions() {
        const senders = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Isaac', 'Julia', 'Kevin', 'Luna', 'Marcus', 'Nina', 'Oscar', 'Penny', 'Quinn', 'Ruby', 'Sam', 'Tina'];
        const receivers = ['Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zoe', 'Alex', 'Beth', 'Carl', 'Dana', 'Ethan', 'Fiona'];
        
        // Keep pool at 15-20 transactions for 50 users (more competition)
        while (this.transactionPool.length < 15) {
            const sender = senders[Math.floor(Math.random() * senders.length)];
            const receiver = receivers[Math.floor(Math.random() * receivers.length)];
            const amount = (Math.random() * 10 + 0.1).toFixed(2);
            const fee = (Math.random() * 1.0 + 0.01).toFixed(3); // Higher fees for more competition
            
            const transaction = {
                id: Date.now() + Math.random(),
                from: sender,
                to: receiver,
                amount: parseFloat(amount),
                fee: parseFloat(fee),
                timestamp: Date.now()
            };
            
            this.transactionPool.push(transaction);
        }
    }

    selectTransaction(transactionId) {
        if (this.selectedTransactions.length >= this.maxBlockSize) {
            this.showNotification('Block is full! Maximum 5 transactions per block.', 'warning');
            return;
        }

        const transaction = this.transactionPool.find(t => t.id === transactionId);
        if (transaction && !this.selectedTransactions.find(t => t.id === transactionId)) {
            this.selectedTransactions.push(transaction);
            // Reset timestamp when transactions change
            this.currentBlockTimestamp = null;
            this.updateDisplay();
            this.calculateHash();
        }
    }

    removeTransaction(transactionId) {
        this.selectedTransactions = this.selectedTransactions.filter(t => t.id !== transactionId);
        this.currentBlockTimestamp = null;
        this.updateDisplay();
        this.calculateHash();
    }

    calculateHash() {
        const previousHash = this.blockchain[this.blockchain.length - 1].hash;
        const nonce = parseInt(document.getElementById('nonceInput').value) || 0;
        const transactions = this.selectedTransactions.map(t => `${t.from}->${t.to}:${t.amount}`).join('|');
        
        // Use fixed timestamp for consistent hashing during mining session
        if (!this.currentBlockTimestamp) {
            this.currentBlockTimestamp = Date.now();
        }
        const timestamp = this.currentBlockTimestamp;
        
        const blockData = `${this.blockHeight}${previousHash}${transactions}${timestamp}${nonce}`;
        const hash = this.simpleHash(blockData);
        
        document.getElementById('prevHash').value = previousHash;
        document.getElementById('currentHash').value = hash;
        
        // Check if hash meets difficulty requirement
        const target = '0'.repeat(this.difficulty);
        document.getElementById('targetHash').value = target + '...(any characters)';
        
        // More robust validation - ensure we're checking the exact string
        const isValid = hash.substring(0, this.difficulty) === target;
        
        document.getElementById('submitBlockBtn').disabled = !isValid || this.selectedTransactions.length === 0;
        
        if (isValid && this.selectedTransactions.length > 0) {
            document.getElementById('currentHash').style.background = '#c6f6d5';
            document.getElementById('currentHash').style.color = '#2d3748';
            this.showNotification(`✅ Valid hash found! Hash: ${hash.substring(0, 8)}...`, 'success');
        } else {
            document.getElementById('currentHash').style.background = '';
            document.getElementById('currentHash').style.color = '';
        }
        
        return { hash, isValid, target, timestamp };
    }

    simpleHash(input) {
        // Educational hash function with better control over leading zeros
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        // Extract nonce from input for deterministic behavior
        const nonceMatch = input.match(/(\d+)$/);
        const nonce = nonceMatch ? parseInt(nonceMatch[1]) : 0;
        
        // Create hash with controlled leading zero probability
        const hashNum = Math.abs(hash);
        const seed = (hashNum + nonce * 7919) % 16777216; // Use prime number for better distribution
        
        // Convert to hex and ensure we can get leading zeros
        let result = seed.toString(16).padStart(6, '0');
        
        // Add more hex characters for realistic length
        const extra1 = ((hashNum * 31 + nonce) % 65536).toString(16).padStart(4, '0');
        const extra2 = ((hashNum * 17 + nonce * 13) % 65536).toString(16).padStart(4, '0');
        
        result = result + extra1 + extra2;
        
        return result.substring(0, 16);
    }

    incrementNonce() {
        const nonceInput = document.getElementById('nonceInput');
        nonceInput.value = parseInt(nonceInput.value || 0) + 1;
        this.calculateHash();
    }

    prepareBlock() {
        // Auto-select transactions with highest fees first
        if (this.selectedTransactions.length === 0) {
            const sortedTransactions = [...this.transactionPool]
                .sort((a, b) => b.fee - a.fee)
                .slice(0, 5);
            
            this.selectedTransactions = sortedTransactions;
            this.updateDisplay();
            this.showNotification('✅ Block prepared with 5 highest fee transactions! Now you can mine.', 'success');
        } else {
            this.showNotification('Block already has transactions selected. You can mine now or modify your selection.', 'info');
        }
        
        // Enable mining button and calculate initial hash
        this.calculateHash();
        this.updateMiningButtons();
    }

    toggleAutoMine() {
        // Only allow mining if there are transactions selected
        if (this.selectedTransactions.length === 0) {
            this.showNotification('⚠️ Please prepare your block first! Click "Prepare Block" to select transactions before mining.', 'warning');
            return;
        }

        this.isAutoMining = !this.isAutoMining;
        const btn = document.getElementById('autoMineBtn');
        
        if (this.isAutoMining) {
            btn.textContent = 'Stop Mining';
            btn.style.background = '#e53e3e';
            this.autoMine();
        } else {
            btn.textContent = 'Mine Now';
            btn.style.background = '#ed8936';
        }
    }

    async autoMine() {
        if (!this.isAutoMining) return;
        
        const nonceInput = document.getElementById('nonceInput');
        let nonce = parseInt(nonceInput.value) || 0;
        let attempts = 0;
        
        const mineStep = () => {
            if (!this.isAutoMining) return;
            
            nonceInput.value = nonce;
            const result = this.calculateHash();
            attempts++;
            
            // Update UI every 100 attempts to show progress
            if (attempts % 100 === 0) {
                this.showNotification(`Mining... tried ${attempts} nonces`, 'info');
            }
            
            if (result.isValid) {
                this.toggleAutoMine();
                this.showNotification(`✅ Found valid hash with nonce ${nonce} after ${attempts} attempts!`, 'success');
                return;
            }
            
            nonce++;
            
            // Prevent infinite loops - increased limit for higher difficulty
            if (attempts > 200000) {
                this.toggleAutoMine();
                this.showNotification('Auto-mining stopped after 200,000 attempts. Consider lowering difficulty.', 'warning');
                return;
            }
            
            // Continue mining with a small delay to prevent browser freeze
            setTimeout(mineStep, 1);
        };
        
        mineStep();
    }

    submitBlock() {
        if (this.selectedTransactions.length === 0) {
            this.showNotification('No transactions selected!', 'error');
            return;
        }

        // Use the same calculation method to ensure consistency
        const result = this.calculateHash();
        const target = '0'.repeat(this.difficulty);
        const actuallyValid = result.hash.substring(0, this.difficulty) === target;
        
        if (!actuallyValid) {
            this.showNotification(`Hash validation failed! Expected: ${target}..., Got: ${result.hash.substring(0, this.difficulty)}...`, 'error');
            console.log('Debug - Hash:', result.hash, 'Target:', target, 'Valid:', actuallyValid);
            return;
        }

        // Create new block using the same timestamp from calculation
        const newBlock = {
            index: this.blockHeight,
            timestamp: result.timestamp,
            transactions: [...this.selectedTransactions],
            previousHash: this.blockchain[this.blockchain.length - 1].hash,
            hash: result.hash,
            nonce: parseInt(document.getElementById('nonceInput').value),
            miner: this.player.name
        };

        // Add block to blockchain
        this.blockchain.push(newBlock);
        
        // Calculate rewards - focus on blocks mined, not transaction fees
        const blockReward = 10; // Base reward for mining a block
        const transactionFees = this.selectedTransactions.reduce((sum, t) => sum + t.fee, 0);
        const totalReward = blockReward + transactionFees;
        
        // Update player stats - track blocks mined separately
        this.player.blocksMinedCount++;
        this.player.score += totalReward; // Keep total coins for display
        document.getElementById('playerScore').textContent = this.player.score.toFixed(3);

        // Remove mined transactions from pool
        this.selectedTransactions.forEach(selectedTx => {
            this.transactionPool = this.transactionPool.filter(poolTx => poolTx.id !== selectedTx.id);
        });

        // Reset for next block - IMPORTANT: Reset timestamp for new mining session
        this.selectedTransactions = [];
        this.blockHeight++;
        this.currentBlockTimestamp = null; // Reset timestamp for next block
        document.getElementById('nonceInput').value = '0';
        document.getElementById('currentHash').value = '';
        document.getElementById('currentHash').style.background = '';
        document.getElementById('currentHash').style.color = '';
        document.getElementById('submitBlockBtn').disabled = true;

        // Generate new transactions
        this.generateTransactions();

        this.updateDisplay();
        this.showNotification(`🎉 Block #${newBlock.index} mined successfully! Blocks mined: ${this.player.blocksMinedCount}`, 'success');
    }

    updateDifficulty() {
        // Only allow instructors to update difficulty
        if (this.userRole !== 'instructor') {
            this.showNotification('Only instructors can change difficulty', 'error');
            return;
        }

        const newDifficulty = parseInt(document.getElementById('difficultyInput').value);
        if (newDifficulty >= 4 && newDifficulty <= 7) {
            this.difficulty = newDifficulty;
            
            // Update session data if in a session
            if (this.sessionId) {
                this.updateSessionDifficulty(newDifficulty);
            }
            
            this.updateDisplay();
            this.calculateHash();
            this.showNotification(`Difficulty updated to ${newDifficulty} leading zeros for all participants`, 'success');
        } else {
            this.showNotification('Difficulty must be between 4 and 7', 'error');
        }
    }

    updateSessionDifficulty(newDifficulty) {
        if (!this.sessionId) return;
        
        const updates = {};
        updates[`sessions/${this.sessionId}/gameState/difficulty`] = newDifficulty;
        updates[`sessions/${this.sessionId}/settings/lastUpdated`] = Date.now();
        
        database.ref().update(updates).catch((error) => {
            console.error('Error updating difficulty:', error);
            this.showNotification('Error updating difficulty. Please try again.', 'error');
        });
    }

    updateMiningButtons() {
        const autoMineBtn = document.getElementById('autoMineBtn');
        const submitBtn = document.getElementById('submitBlockBtn');
        
        // Enable/disable mining button based on transaction selection
        if (this.selectedTransactions.length > 0) {
            autoMineBtn.disabled = false;
            autoMineBtn.textContent = 'Mine Now';
        } else {
            autoMineBtn.disabled = true;
            autoMineBtn.textContent = 'Mine Now';
            submitBtn.disabled = true;
        }
    }

    updateDisplay() {
        // Update submit button text
        const submitBtn = document.getElementById('submitBlockBtn');
        submitBtn.textContent = 'Submit Block';

        // Update game stats
        document.getElementById('blockHeight').textContent = this.blockHeight;
        document.getElementById('difficulty').textContent = this.difficulty;
        document.getElementById('difficultyInput').value = this.difficulty;
        
        // Update transaction pool
        const poolElement = document.getElementById('transactionPool');
        poolElement.innerHTML = '';
        
        this.transactionPool.forEach(tx => {
            const txElement = document.createElement('div');
            txElement.className = 'transaction';
            txElement.onclick = () => this.selectTransaction(tx.id);
            
            // Show if transaction was created by a player
            const createdByText = tx.createdBy ? ` (added by ${tx.createdBy})` : '';
            
            txElement.innerHTML = `
                <div class="transaction-info">
                    <div><strong>${tx.from}</strong> → <strong>${tx.to}</strong></div>
                    <div>Amount: ${tx.amount} coins${createdByText}</div>
                </div>
                <div class="transaction-fee">Fee: ${tx.fee}</div>
            `;
            
            poolElement.appendChild(txElement);
        });

        // Update selected transactions
        const selectedElement = document.getElementById('selectedTransactions');
        selectedElement.innerHTML = '';
        
        this.selectedTransactions.forEach(tx => {
            const txElement = document.createElement('div');
            txElement.className = 'selected-transaction';
            txElement.onclick = () => this.removeTransaction(tx.id);
            txElement.innerHTML = `${tx.from} → ${tx.to}: ${tx.amount} (fee: ${tx.fee}) <span style="float: right; cursor: pointer;">✕</span>`;
            selectedElement.appendChild(txElement);
        });

        // Update block space
        document.getElementById('blockSpace').textContent = `${this.selectedTransactions.length}/5`;

        // Update blockchain display
        this.updateBlockchainDisplay();
        
        // Update leaderboard
        this.updateLeaderboard();
        
        // Update mining buttons
        this.updateMiningButtons();
    }

    updateBlockchainDisplay() {
        const blockchainElement = document.getElementById('blockchain');
        blockchainElement.innerHTML = '';

        this.blockchain.forEach((block, index) => {
            const blockElement = document.createElement('div');
            blockElement.className = `block ${index === 0 ? 'genesis' : 'mined'}`;
            
            const transactionsList = block.transactions.length > 0 ? 
                block.transactions.map(tx => 
                    `<div class="block-transaction">💰 ${tx.from} → ${tx.to}: ${tx.amount} (fee: ${tx.fee})</div>`
                ).join('') : 
                '<div class="block-transaction">Genesis Block</div>';

            blockElement.innerHTML = `
                <div class="block-header">Block #${block.index}</div>
                <div class="block-hash">${block.hash.substring(0, 12)}...</div>
                <div class="block-info-section">
                    <div class="block-stats">Transactions: ${block.transactions.length} | Miner: ${block.miner}</div>
                    <div class="block-transactions-list">
                        ${transactionsList}
                    </div>
                </div>
            `;
            
            blockchainElement.appendChild(blockElement);
        });
    }

    updateLeaderboard() {
        const leaderboardElement = document.getElementById('leaderboard');
        leaderboardElement.innerHTML = '';

        // Convert players map to array and sort by total fees earned
        const sortedPlayers = Array.from(this.players.values())
            .sort((a, b) => b.totalFeesEarned - a.totalFeesEarned);

        if (sortedPlayers.length === 0) {
            leaderboardElement.innerHTML = '<div>No players yet</div>';
            return;
        }

        // Add header showing total miners
        const headerElement = document.createElement('div');
        headerElement.className = 'leaderboard-header';
        headerElement.innerHTML = `<strong>Active Miners: ${this.players.size}/${this.maxParticipants} (Ranked by Fees Earned)</strong>`;
        leaderboardElement.appendChild(headerElement);

        // Show top 10 players to keep it manageable with 50 users
        const topPlayers = sortedPlayers.slice(0, 10);
        
        topPlayers.forEach((player, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-entry';
            entryElement.innerHTML = `
                <span>${index + 1}. ${player.name}</span>
                <span>${player.totalFeesEarned.toFixed(3)} fees (${player.transactionsMinedCount} txs)</span>
            `;
            leaderboardElement.appendChild(entryElement);
        });

        // Show current player's rank if not in top 10
        if (this.player && !topPlayers.includes(this.player)) {
            const playerRank = sortedPlayers.findIndex(p => p.name === this.player.name) + 1;
            const dividerElement = document.createElement('div');
            dividerElement.className = 'leaderboard-divider';
            dividerElement.innerHTML = '...';
            leaderboardElement.appendChild(dividerElement);

            const playerElement = document.createElement('div');
            playerElement.className = 'leaderboard-entry current-player';
            playerElement.innerHTML = `
                <span>${playerRank}. ${this.player.name} (You)</span>
                <span>${this.player.totalFeesEarned.toFixed(3)} fees (${this.player.transactionsMinedCount} txs)</span>
            `;
            leaderboardElement.appendChild(playerElement);
        }
    }

    selectTransaction(transactionId) {
        const transaction = this.transactionPool.find(t => t.id === transactionId);
        if (!transaction) return;

        // Full block mining: select up to 5 transactions
        if (this.selectedTransactions.length >= 5) {
            this.showNotification('Block is full! Maximum 5 transactions per block.', 'warning');
            return;
        }

        if (!this.selectedTransactions.find(t => t.id === transactionId)) {
            this.selectedTransactions.push(transaction);
            this.currentBlockTimestamp = null;
            this.updateDisplay();
            this.calculateHash();
            this.showNotification(`Added transaction: ${transaction.from} → ${transaction.to} (Fee: ${transaction.fee})`, 'success');
        }
    }

    submitBlock() {
        if (this.selectedTransactions.length === 0) {
            this.showNotification('No transactions selected!', 'error');
            return;
        }

        const result = this.calculateHash();
        const target = '0'.repeat(this.difficulty);
        const actuallyValid = result.hash.substring(0, this.difficulty) === target;
        
        if (!actuallyValid) {
            this.showNotification(`Hash validation failed! Expected: ${target}..., Got: ${result.hash.substring(0, this.difficulty)}...`, 'error');
            return;
        }

        // Create new block
        const newBlock = {
            index: this.blockHeight,
            timestamp: result.timestamp,
            transactions: [...this.selectedTransactions],
            previousHash: this.blockchain[this.blockchain.length - 1].hash,
            hash: result.hash,
            nonce: parseInt(document.getElementById('nonceInput').value),
            miner: this.player.name
        };

        // Add block to local blockchain first
        this.blockchain.push(newBlock);
        
        // Calculate rewards - focus on transaction fees
        const transactionFees = this.selectedTransactions.reduce((sum, t) => sum + t.fee, 0);
        const baseReward = 3; // Base reward for mining a block
        const totalReward = baseReward + transactionFees;
        
        this.player.totalFeesEarned += transactionFees;
        this.player.transactionsMinedCount += this.selectedTransactions.length;
        this.player.blocksMinedCount++;
        this.player.score += totalReward;
        document.getElementById('playerScore').textContent = this.player.totalFeesEarned.toFixed(3);

        // Remove mined transactions from pool
        this.selectedTransactions.forEach(selectedTx => {
            this.transactionPool = this.transactionPool.filter(poolTx => poolTx.id !== selectedTx.id);
        });

        // Update Firebase with new block and game state
        if (this.sessionId) {
            this.updateFirebaseGameState();
            this.updateFirebasePlayerScore(this.player.name, this.player.score, this.player.blocksMinedCount, this.player.totalFeesEarned);
        }

        // Reset for next block
        this.selectedTransactions = [];
        this.blockHeight++;
        this.currentBlockTimestamp = null;
        document.getElementById('nonceInput').value = '0';
        document.getElementById('currentHash').value = '';
        document.getElementById('currentHash').style.background = '';
        document.getElementById('submitBlockBtn').disabled = true;
        
        // Reset mining buttons
        document.getElementById('autoMineBtn').disabled = true;
        document.getElementById('autoMineBtn').textContent = 'Mine Now';
        document.getElementById('autoMineBtn').style.background = '#ed8936';

        this.generateTransactions();
        this.updateDisplay();
        this.showNotification(`🎉 Block #${newBlock.index} mined successfully! Earned ${transactionFees.toFixed(3)} in fees!`, 'success');
    }



    showInstructions() {
        document.getElementById('instructionsModal').classList.remove('hidden');
    }

    hideInstructions() {
        document.getElementById('instructionsModal').classList.add('hidden');
    }

    showAddTransactionModal() {
        document.getElementById('addTransactionModal').classList.remove('hidden');
        // Clear form
        document.getElementById('addTransactionForm').reset();
        // Set default fee
        document.getElementById('feeInput').value = '0.050';
    }

    hideAddTransactionModal() {
        document.getElementById('addTransactionModal').classList.add('hidden');
    }

    handleAddTransaction(e) {
        e.preventDefault();
        
        const sender = document.getElementById('senderInput').value.trim();
        const receiver = document.getElementById('receiverInput').value.trim();
        const amount = parseFloat(document.getElementById('amountInput').value);
        const fee = parseFloat(document.getElementById('feeInput').value);

        // Validation
        if (!sender || !receiver) {
            this.showNotification('Please enter both sender and receiver names', 'error');
            return;
        }

        if (sender === receiver) {
            this.showNotification('Sender and receiver cannot be the same', 'error');
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            this.showNotification('Please enter a valid amount greater than 0', 'error');
            return;
        }

        if (isNaN(fee) || fee < 0.001) {
            this.showNotification('Please enter a valid fee (minimum 0.001)', 'error');
            return;
        }

        // Create new transaction
        const transaction = {
            id: Date.now() + Math.random(),
            from: sender,
            to: receiver,
            amount: amount,
            fee: fee,
            timestamp: Date.now(),
            createdBy: this.player.name
        };

        this.transactionPool.push(transaction);
        this.updateDisplay();
        this.hideAddTransactionModal();
        
        this.showNotification(`✅ Transaction created: ${sender} → ${receiver} (${amount} coins, fee: ${fee})`, 'success');
    }

    // Role Selection Methods
    showRoleSelection() {
        document.getElementById('roleSelectionScreen').classList.remove('hidden');
        document.getElementById('instructorSetupScreen').classList.add('hidden');
        document.getElementById('studentJoinScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
    }

    showInstructorSetup() {
        document.getElementById('roleSelectionScreen').classList.add('hidden');
        document.getElementById('instructorSetupScreen').classList.remove('hidden');
        document.getElementById('instructorNameInput').focus();
    }

    showStudentJoin() {
        document.getElementById('roleSelectionScreen').classList.add('hidden');
        document.getElementById('studentJoinScreen').classList.remove('hidden');
        document.getElementById('studentNameInput').focus();
    }

    handleInstructorSetup(e) {
        e.preventDefault();
        
        const instructorName = document.getElementById('instructorNameInput').value.trim();
        const sessionId = document.getElementById('sessionIdInput').value.trim().toUpperCase();
        const selectedDifficulty = document.getElementById('difficultySelect').value;
        
        // Validate inputs
        if (!instructorName) {
            this.showNotification('Please enter your name', 'error');
            return;
        }
        
        if (!this.validateSessionId(sessionId)) {
            this.showNotification('Session ID must be 4-8 alphanumeric characters', 'error');
            return;
        }
        
        if (!selectedDifficulty) {
            this.showNotification('Please select a difficulty level', 'error');
            return;
        }
        
        // Create session with selected difficulty
        this.createSession(sessionId, instructorName, parseInt(selectedDifficulty));
    }

    handleStudentJoin(e) {
        e.preventDefault();
        
        const studentName = document.getElementById('studentNameInput').value.trim();
        const sessionId = document.getElementById('joinSessionIdInput').value.trim().toUpperCase();
        
        // Validate inputs
        if (!studentName) {
            this.showNotification('Please enter your name', 'error');
            return;
        }
        
        if (!this.validateSessionId(sessionId)) {
            this.showNotification('Session ID must be 4-8 alphanumeric characters', 'error');
            return;
        }
        
        // Join session
        this.joinSession(sessionId, studentName);
    }

    validateSessionId(sessionId) {
        // Check if session ID is 4-8 alphanumeric characters
        const regex = /^[A-Z0-9]{4,8}$/;
        return regex.test(sessionId);
    }

    createSession(sessionId, instructorName, difficulty) {
        // Check if session already exists in Firebase
        database.ref(`sessions/${sessionId}`).once('value')
            .then((snapshot) => {
                if (snapshot.exists()) {
                    this.showNotification('Session ID already exists. Please choose a different ID.', 'error');
                    return;
                }
                
                // Set the difficulty for this session
                this.difficulty = difficulty;
                
                // Create new session data
                const sessionData = {
                    sessionId: sessionId,
                    instructor: {
                        name: instructorName,
                        joinTime: Date.now()
                    },
                    participants: {
                        [instructorName]: {
                            name: instructorName,
                            role: 'instructor',
                            joinTime: Date.now(),
                            score: 0,
                            blocksMinedCount: 0,
                            totalFeesEarned: 0
                        }
                    },
                    gameState: {
                        blockchain: [...this.blockchain],
                        transactionPool: [...this.transactionPool],
                        difficulty: difficulty,
                        blockHeight: this.blockHeight,
                        currentBlockRace: {
                            blockHeight: this.blockHeight,
                            isActive: false,
                            participants: [],
                            winner: null,
                            winningTimestamp: null
                        },
                        recentActivity: []
                    },
                    settings: {
                        maxParticipants: this.maxParticipants,
                        createdAt: Date.now(),
                        lastUpdated: Date.now()
                    }
                };
                
                // Save session data to Firebase
                return database.ref(`sessions/${sessionId}`).set(sessionData);
            })
            .then(() => {
                // Set instance variables
                this.sessionId = sessionId;
                this.userRole = 'instructor';
                this.player = {
                    name: instructorName,
                    role: 'instructor',
                    joinTime: Date.now(),
                    score: 0,
                    blocksMinedCount: 0,
                    totalFeesEarned: 0
                };
                this.players.set(instructorName, this.player);
                
                // Set up Firebase listeners for real-time updates
                this.setupFirebaseListeners();
                
                // Start the game
                this.startSessionGame();
                
                this.showNotification(`✅ Session "${sessionId}" created successfully! Share this ID with your students.`, 'success');
            })
            .catch((error) => {
                console.error('Error creating session:', error);
                this.showNotification('Error creating session. Please try again.', 'error');
            });
    }

    joinSession(sessionId, studentName) {
        // Try to load existing session from Firebase
        database.ref(`sessions/${sessionId}`).once('value')
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    this.showNotification('Session not found. Please check the session ID.', 'error');
                    return;
                }
                
                const sessionData = snapshot.val();
        
                // Check if session is full
                const participantCount = Object.keys(sessionData.participants).length;
                if (participantCount >= this.maxParticipants) {
                    this.showNotification(`Session is full! Maximum ${this.maxParticipants} participants allowed.`, 'error');
                    return;
                }
                
                // Check if username already exists
                if (sessionData.participants[studentName]) {
                    this.showNotification('Username already taken in this session. Please choose a different name.', 'error');
                    return;
                }
                
                // Add student to session
                const studentData = {
                    name: studentName,
                    role: 'student',
                    joinTime: Date.now(),
                    score: 0,
                    blocksMinedCount: 0,
                    totalFeesEarned: 0
                };
                
                // Update session data in Firebase
                const updates = {};
                updates[`sessions/${sessionId}/participants/${studentName}`] = studentData;
                updates[`sessions/${sessionId}/settings/lastUpdated`] = Date.now();
                
                return database.ref().update(updates);
            })
            .then(() => {
                // Set instance variables
                this.sessionId = sessionId;
                this.userRole = 'student';
                this.player = {
                    name: studentName,
                    role: 'student',
                    joinTime: Date.now(),
                    score: 0,
                    blocksMinedCount: 0,
                    totalFeesEarned: 0
                };
                
                // Set up Firebase listeners for real-time updates
                this.setupFirebaseListeners();
                
                // Load session game state from Firebase
                this.loadFirebaseGameState();
                
                // Start the game
        this.loadSessionGameState(sessionData);
        
        // Start the game
        this.startSessionGame();
        
        this.showNotification(`✅ Joined session "${sessionId}"! (${sessionData.participants.length}/${this.maxParticipants} participants)`, 'success');
    }

    createNewSessionForStudent(sessionId, studentName) {
        // Create a basic session for local testing when instructor hasn't created one yet
        const sessionData = {
            sessionId: sessionId,
            instructor: null, // No instructor yet
            participants: [
                {
                    name: studentName,
                    role: 'student',
                    joinTime: Date.now(),
                    score: 0,
                    blocksMinedCount: 0,
                    totalFeesEarned: 0
                }
            ],
            gameState: {
                blockchain: [...this.blockchain],
                transactionPool: [...this.transactionPool],
                difficulty: this.difficulty,
                blockHeight: this.blockHeight,
                currentBlockRace: {
                    blockHeight: this.blockHeight,
                    isActive: false,
                    participants: [],
                    winner: null,
                    winningTimestamp: null
                },
                recentActivity: []
            },
            settings: {
                maxParticipants: this.maxParticipants,
                createdAt: Date.now(),
                lastUpdated: Date.now()
            }
        };
        
        // Save session data
        localStorage.setItem(`blockchain_session_${sessionId}`, JSON.stringify(sessionData));
        localStorage.setItem('blockchain_current_session', sessionId);
        localStorage.setItem('blockchain_user_role', 'student');
        
        // Set instance variables
        this.sessionId = sessionId;
        this.userRole = 'student';
        this.player = sessionData.participants[0];
        
        // Start the game
        this.startSessionGame();
        
        this.showNotification(`✅ Joined session "${sessionId}"! You're the first participant.`, 'success');
    }

    loadSessionGameState(sessionData) {
        // Load shared game state
        this.blockchain = sessionData.gameState.blockchain;
        this.transactionPool = sessionData.gameState.transactionPool;
        this.difficulty = sessionData.gameState.difficulty;
        this.blockHeight = sessionData.gameState.blockHeight;
        
        // Load all participants
        this.players.clear();
        sessionData.participants.forEach(participant => {
            this.players.set(participant.name, participant);
        });
    }

    startSessionGame() {
        // Hide all setup screens and show game screen
        document.getElementById('roleSelectionScreen').classList.add('hidden');
        document.getElementById('instructorSetupScreen').classList.add('hidden');
        document.getElementById('studentJoinScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        
        // Update player name display
        document.getElementById('playerName').textContent = this.player.name;
        
        // Configure role-based UI controls
        this.configureRoleBasedUI();
        
        // Initialize the game display
        this.initializeGame();
        
        // Show role-specific welcome message
        if (this.userRole === 'instructor') {
            this.showNotification('🎓 Welcome, Instructor! You can adjust difficulty and manage the session.', 'info');
        } else {
            this.showNotification('📚 Welcome, Student! Start mining blocks to earn rewards!', 'info');
        }
    }

    configureRoleBasedUI() {
        const difficultyControl = document.querySelector('.difficulty-control');
        
        if (this.userRole === 'student') {
            // Hide difficulty controls for students
            if (difficultyControl) {
                difficultyControl.style.display = 'none';
            }
        } else if (this.userRole === 'instructor') {
            // Show difficulty controls for instructors
            if (difficultyControl) {
                difficultyControl.style.display = 'block';
            }
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        // Different timeout for different types
        const timeout = type === 'info' ? 3000 : 4000;
        setTimeout(() => {
            notification.remove();
        }, timeout);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BlockchainGame();
});
 
   setupFirebaseListeners() {
        if (!this.sessionId) return;
        
        // Listen for blockchain updates
        const blockchainRef = database.ref(`sessions/${this.sessionId}/gameState/blockchain`);
        const blockchainListener = blockchainRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.blockchain = snapshot.val();
                this.updateBlockchainDisplay();
            }
        });
        this.firebaseListeners.push({ ref: blockchainRef, listener: blockchainListener });
        
        // Listen for transaction pool updates
        const transactionRef = database.ref(`sessions/${this.sessionId}/gameState/transactionPool`);
        const transactionListener = transactionRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.transactionPool = snapshot.val();
                this.updateTransactionPoolDisplay();
            }
        });
        this.firebaseListeners.push({ ref: transactionRef, listener: transactionListener });
        
        // Listen for participant updates (leaderboard)
        const participantsRef = database.ref(`sessions/${this.sessionId}/participants`);
        const participantsListener = participantsRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const participants = snapshot.val();
                this.players.clear();
                Object.values(participants).forEach(participant => {
                    this.players.set(participant.name, participant);
                });
                this.updateLeaderboard();
            }
        });
        this.firebaseListeners.push({ ref: participantsRef, listener: participantsListener });
        
        // Listen for difficulty changes
        const difficultyRef = database.ref(`sessions/${this.sessionId}/gameState/difficulty`);
        const difficultyListener = difficultyRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.difficulty = snapshot.val();
                this.updateDisplay();
            }
        });
        this.firebaseListeners.push({ ref: difficultyRef, listener: difficultyListener });
        
        // Listen for block height updates
        const blockHeightRef = database.ref(`sessions/${this.sessionId}/gameState/blockHeight`);
        const blockHeightListener = blockHeightRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.blockHeight = snapshot.val();
                this.updateDisplay();
            }
        });
        this.firebaseListeners.push({ ref: blockHeightRef, listener: blockHeightListener });
    }
    
    loadFirebaseGameState() {
        if (!this.sessionId) return;
        
        database.ref(`sessions/${this.sessionId}/gameState`).once('value')
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const gameState = snapshot.val();
                    this.blockchain = gameState.blockchain || [];
                    this.transactionPool = gameState.transactionPool || [];
                    this.difficulty = gameState.difficulty || 5;
                    this.blockHeight = gameState.blockHeight || 1;
                    
                    // Start the game
                    this.startSessionGame();
                    
                    const participantCount = Object.keys(snapshot.ref.parent.child('participants').val() || {}).length;
                    this.showNotification(`✅ Joined session "${this.sessionId}"! (${participantCount}/${this.maxParticipants} participants)`, 'success');
                }
            })
            .catch((error) => {
                console.error('Error loading game state:', error);
                this.showNotification('Error loading session data.', 'error');
            });
    }
    
    updateFirebaseGameState() {
        if (!this.sessionId) return;
        
        const updates = {};
        updates[`sessions/${this.sessionId}/gameState/blockchain`] = this.blockchain;
        updates[`sessions/${this.sessionId}/gameState/transactionPool`] = this.transactionPool;
        updates[`sessions/${this.sessionId}/gameState/blockHeight`] = this.blockHeight;
        updates[`sessions/${this.sessionId}/settings/lastUpdated`] = Date.now();
        
        database.ref().update(updates).catch((error) => {
            console.error('Error updating game state:', error);
        });
    }
    
    updateFirebasePlayerScore(playerName, newScore, blocksMinedCount, totalFeesEarned) {
        if (!this.sessionId) return;
        
        const updates = {};
        updates[`sessions/${this.sessionId}/participants/${playerName}/score`] = newScore;
        updates[`sessions/${this.sessionId}/participants/${playerName}/blocksMinedCount`] = blocksMinedCount;
        updates[`sessions/${this.sessionId}/participants/${playerName}/totalFeesEarned`] = totalFeesEarned;
        
        database.ref().update(updates).catch((error) => {
            console.error('Error updating player score:', error);
        });
    }
    
    cleanupFirebaseListeners() {
        this.firebaseListeners.forEach(({ ref, listener }) => {
            ref.off('value', listener);
        });
        this.firebaseListeners = [];
    }