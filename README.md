# BrunoX Chat - Decentralized Messaging App

A decentralized messaging application powered by blockchain technology, built with React, TypeScript, Supabase, and integrated with Ethereum/Ganache for blockchain verification.

![BrunoX Chat](./src/assets/ocean-waves-hero.jpg)

## 🚀 Features

- **Real-time Messaging**: Instant messaging with real-time updates
- **Blockchain Integration**: Message verification using Ethereum blockchain
- **Decentralized Storage**: Secure message storage with blockchain hashing
- **Friend System**: Add friends and manage conversations
- **Web3 Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Local Blockchain Testing**: Full Ganache integration for development
- **Authentication**: Secure user authentication with Supabase Auth
- **Responsive Design**: Modern UI with dark/light theme support

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Auth, Real-time)
- **Blockchain**: Ethereum, Ethers.js, Ganache
- **Web3**: MetaMask integration, Wallet connections
- **State Management**: React Context API
- **Routing**: React Router v6

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)
- **MetaMask Browser Extension** - [Install here](https://metamask.io/)
- **Ganache** (for local blockchain) - [Download here](https://trufflesuite.com/ganache/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory (if not already present):

```env
VITE_SUPABASE_URL=https://onkmssciuonxlticpiey.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ua21zc2NpdW9ueGx0aWNwaWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODkwMjAsImV4cCI6MjA3MTk2NTAyMH0.2BEp_uuqThmDNWj-E73iG25N4cAweUEfrzcZv_ovkAI
```

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## ⚙️ Complete Setup Guide

### 🔐 Supabase Setup

The application uses Supabase for backend services. The database is already configured, but if you want to set up your own instance:

1. Create a [Supabase account](https://supabase.com/)
2. Create a new project
3. Update the environment variables with your project credentials
4. Run the database migrations (found in `supabase/migrations/`)

### 🔗 Blockchain Setup (Ganache)

#### Option 1: Ganache GUI (Recommended for beginners)

1. **Download and Install Ganache**
   - Visit [Ganache Download Page](https://trufflesuite.com/ganache/)
   - Download the appropriate version for your OS
   - Install and launch Ganache

2. **Configure Ganache**
   - Create a new workspace or quickstart
   - Set the following configuration:
     - **Port**: 7545 (default)
     - **Network ID**: 1337
     - **Accounts**: 10 (default)
     - **Ether per account**: 100 ETH (default)
   - Click "Save and Restart"

3. **Note the Configuration**
   - RPC Server: `HTTP://127.0.0.1:7545`
   - Network ID: `1337`
   - Make note of the account addresses and private keys

#### Option 2: Ganache CLI

```bash
# Install Ganache CLI globally
npm install -g ganache-cli

# Start Ganache with specific configuration
ganache-cli --port 7545 --networkId 1337 --accounts 10 --ether 100 --deterministic
```

### 🦊 MetaMask Setup

1. **Install MetaMask**
   - Add the [MetaMask extension](https://metamask.io/) to your browser
   - Create a new wallet or import existing one

2. **Add Ganache Network**
   - Open MetaMask
   - Click on the network dropdown (usually shows "Ethereum Mainnet")
   - Click "Add Network" → "Add Network Manually"
   - Enter the following details:
     ```
     Network Name: Ganache Local
     New RPC URL: http://127.0.0.1:7545
     Chain ID: 1337
     Currency Symbol: ETH
     Block Explorer URL: (leave empty)
     ```
   - Click "Save"

3. **Import Ganache Account**
   - Copy a private key from Ganache (click the key icon next to any account)
   - In MetaMask, click the account icon → "Import Account"
   - Paste the private key and click "Import"
   - You should now see the account with 100 ETH

### 🔗 Connecting to the Application

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Access the App**
   - Open `http://localhost:5173` in your browser
   - You should see the BrunoX Chat interface

3. **Connect Your Wallet**
   - Click the "Connect Wallet" button in the sidebar
   - MetaMask will prompt you to connect
   - Select the Ganache account you imported
   - Approve the connection

4. **Create an Account**
   - Click "Sign Up" if you're a new user
   - Enter your email, password, and username
   - Verify your email (check your inbox)

5. **Start Chatting**
   - Add friends using the search functionality
   - Start conversations with blockchain verification
   - Messages will be hashed and stored on the blockchain

## 🎯 Usage Guide

### Adding Friends

1. Use the search bar to find users by username
2. Click "Add Friend" next to a user's profile
3. Wait for them to accept your friend request
4. Start chatting once the request is accepted

### Sending Messages

1. Click on a friend to start a conversation
2. Type your message in the input field
3. Click "Send" or press Enter
4. Messages are automatically verified on the blockchain if connected

### Blockchain Features

- **Message Verification**: Each message gets a unique blockchain hash
- **Decentralized Storage**: Messages are stored both in Supabase and on blockchain
- **Wallet Integration**: Connect your Web3 wallet for enhanced security
- **Gas Tracking**: Monitor transaction fees and gas usage

## 🔧 Troubleshooting

### Common Issues

1. **MetaMask Connection Failed**
   - Ensure MetaMask is installed and unlocked
   - Check that you're on the Ganache network (Network ID: 1337)
   - Refresh the page and try reconnecting

2. **Ganache Not Connecting**
   - Verify Ganache is running on port 7545
   - Check that the RPC URL is `http://127.0.0.1:7545`
   - Ensure no firewall is blocking the connection

3. **Database Connection Issues**
   - Verify your internet connection
   - Check Supabase project status
   - Ensure environment variables are correct

4. **Transaction Failures**
   - Check that you have sufficient ETH in your account
   - Verify the network settings in MetaMask
   - Try restarting Ganache and reconnecting

### Getting Help

- Check the browser console for error messages
- Verify all prerequisites are installed
- Ensure all services (Ganache, Supabase) are running
- Join our [Discord community](https://discord.com/channels/1119885301872070706/1280461670979993613) for support

## 🏗 Development

### Project Structure

```
src/
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks
├── pages/             # Application pages
├── lib/               # Utility functions
├── integrations/      # External service integrations
└── assets/           # Static assets

supabase/
├── migrations/        # Database migrations
└── functions/        # Edge functions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Powered by [Supabase](https://supabase.com)
- Blockchain integration with [Ethers.js](https://ethers.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---
