# 🔗 Blockchain Mining Simulation Game

An educational blockchain mining game designed for university students to learn proof-of-work concepts through hands-on classroom experience with instructor-managed sessions.

## 🌐 Live Demo

**Game URL**: `https://yourusername.github.io/your-repo-name` *(Replace with your actual GitHub Pages URL)*

## 👨‍🏫 For Instructors

### Creating a Classroom Session

1. **Visit the game URL** above
2. **Select "Instructor"** role
3. **Enter your name** and create a **unique session ID** (4-8 characters, e.g., "MATH101")
4. **Choose difficulty level**:
   - **Easy (4 zeros)**: Beginner friendly, faster mining
   - **Medium (5 zeros)**: Standard difficulty
   - **Hard (6 zeros)**: Advanced challenge
   - **Expert (7 zeros)**: Maximum difficulty, very slow mining
5. **Share the session ID** with your students

### Managing Your Session

- **Up to 80 students** can join your session
- **Only you can adjust difficulty** during gameplay
- **All students** mine at your chosen difficulty level
- **Real-time leaderboard** shows student progress
- **Session data persists** even if page is refreshed

## 👨‍🎓 For Students

### Joining a Session

1. **Get the session ID** from your instructor
2. **Visit the game URL** above
3. **Select "Student"** role
4. **Enter your name** and the **session ID** provided by instructor
5. **Start mining** and compete with your classmates!

## 🎯 Learning Objectives

Students will learn:
- **Blockchain Structure**: How blocks are linked together with hashes
- **Mining Process**: Finding valid nonces through proof-of-work
- **Transaction Management**: How transactions are selected and included in blocks
- **Consensus Mechanism**: Competition between miners to solve blocks
- **Economic Incentives**: Block rewards and transaction fees
- **Difficulty Adjustment**: How mining difficulty increases over time

## 🎮 Game Rules

### Core Mechanics
1. **All students are miners** competing to mine the next block
2. **Transaction Pool**: Shared pool of pending transactions visible to all players
3. **Block Constraints**: Each block can contain maximum 5 transactions
4. **Proof of Work**: Find a nonce that creates a hash starting with required zeros
5. **Rewards**: Earn coins for successfully mining blocks (base reward + transaction fees)
6. **Difficulty**: Increases every 3 blocks to maintain challenge

### How to Play
1. **Select Transactions**: Click on up to 5 pending transactions to include in your block
2. **Prepare Block**: Click "Prepare Block" to auto-select highest fee transactions
3. **Mine**: Use "Mine Now" to automatically search for a valid hash, or manually adjust the nonce
4. **Submit**: Once you find a valid hash (starts with required zeros), submit your block
5. **Compete**: First student to find valid hash wins the block and earns rewards!
6. **Strategy**: Choose transactions with higher fees to maximize your earnings

### Scoring System
- **Block Reward**: 10 coins per successfully mined block
- **Transaction Fees**: Additional coins from included transaction fees
- **Leaderboard**: Track your progress against other students

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Running the Game
1. **Online**: Visit the GitHub Pages URL (recommended for classroom use)
2. **Local**: Download files and open `index.html` in your web browser

### Classroom Setup Tips
- **Project the instructor screen** so students can see session info
- **Use session IDs** that relate to your course (e.g., "CS101", "BLOCK1")
- **Start with Easy difficulty** for first-time players
- **Monitor the leaderboard** to track student engagement
- **Adjust difficulty** if blocks are being mined too quickly or slowly

## 🏫 Classroom Session Features

### Session Management
- **Role-Based Access**: Separate instructor and student interfaces
- **Session Persistence**: Sessions saved in browser local storage
- **Participant Limits**: Up to 80 students per session
- **Real-Time Sync**: Shared blockchain state across all participants
- **Instructor Controls**: Only instructors can modify difficulty settings

### Collaborative Learning
- **Shared Transaction Pool**: All students see the same pending transactions
- **Competitive Mining**: Students race to mine the same blocks
- **Live Leaderboard**: Real-time ranking by fees earned
- **Session Activity**: Track who mines which blocks

## 🔧 Technical Features

### Educational Components
- **Visual Hash Display**: See how nonce changes affect the resulting hash
- **Real-time Blockchain**: Watch the blockchain grow as blocks are mined
- **Transaction Economics**: Understand the relationship between fees and mining incentives
- **Difficulty Visualization**: Experience how mining becomes harder over time

### Game Features
- **Responsive Design**: Works on desktop and mobile devices
- **Auto-mining**: Automated nonce searching for demonstration
- **Real-time Updates**: Live game state updates
- **Score Tracking**: Individual and leaderboard scoring
- **Visual Feedback**: Clear indicators for valid/invalid hashes

## 📚 Educational Use Cases

### Classroom Activities
1. **Individual Mining**: Students compete to mine blocks independently
2. **Team Competition**: Divide class into mining teams
3. **Economic Analysis**: Discuss transaction fee strategies
4. **Security Discussion**: Explore what happens with different difficulty levels

### Learning Discussions
- **Hash Functions**: Why do small changes create completely different hashes?
- **Proof of Work**: What makes this consensus mechanism secure?
- **Mining Economics**: How do miners decide which transactions to include?
- **Network Effects**: What happens as more miners join the network?

## 🎓 Concepts Demonstrated

### Blockchain Fundamentals
- **Immutable Ledger**: Once blocks are mined, they cannot be changed
- **Cryptographic Hashing**: Each block's hash depends on its content
- **Chain Integrity**: Each block references the previous block's hash

### Mining Process
- **Nonce Discovery**: Trial-and-error process to find valid hashes
- **Difficulty Target**: Hash must start with specific number of zeros
- **Competition**: Multiple miners racing to solve the same block

### Economic Incentives
- **Block Rewards**: Fixed reward for mining a block
- **Transaction Fees**: Variable fees paid by transaction senders
- **Fee Market**: Higher fees increase chances of transaction inclusion

## 🔍 Advanced Features

### Customization Options
- Modify `maxBlockSize` to change transactions per block
- Adjust `difficulty` progression rate
- Change reward amounts and fee structures

### Extension Ideas
- Add different transaction types
- Implement mining pools
- Create network latency simulation
- Add double-spending scenarios

## 🤝 Contributing

This is an educational tool designed for learning. Suggestions for improvements:
- Additional blockchain concepts to demonstrate
- Enhanced visualization features
- More realistic mining algorithms
- Multi-player networking capabilities

## 📄 License

This educational simulation is provided for learning purposes. Feel free to modify and adapt for your educational needs.

---

**Happy Mining! ⛏️**