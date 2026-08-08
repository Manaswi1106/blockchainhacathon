# 🚀 BlockPay AI

### AI-Powered Blockchain Payment Platform

BlockPay AI is an intelligent digital payment platform that combines **Artificial Intelligence, Blockchain, secure payment processing, QR payments, and policy-based transaction controls** into a single application.

The platform is designed to make digital payments more secure, transparent, and intelligent by analyzing transactions before execution and providing users with AI-powered payment assistance.

---

## 🏆 Hackathon Project

**Project:** BlockPay AI  
**Category:** AI + Blockchain + FinTech  
**Blockchain:** Algorand TestNet  
**AI:** Google Gemini  
**Frontend Deployment:** Vercel  
**Backend Deployment:** Render  
**Source Code:** GitHub

---

# 🎯 Problem Statement

Digital payment systems are convenient, but users still face several challenges:

- Payment fraud and suspicious transactions
- Lack of intelligent transaction analysis
- Difficulty controlling spending limits
- Limited transparency in payment processing
- Lack of AI-powered financial assistance
- Difficulty verifying blockchain transactions
- Increasing need for autonomous AI-agent payments

BlockPay AI addresses these challenges by combining AI-driven analysis with blockchain-based payment infrastructure.

---

# 💡 Our Solution

BlockPay AI provides a unified platform where users can:

- Manage their digital wallet
- Send and receive payments
- Generate and scan QR codes
- Analyze transactions using AI
- Detect potentially fraudulent transactions
- Set spending policies and transaction limits
- View transaction history
- Explore blockchain activity
- Receive payment notifications
- Interact with an AI payment assistant
- Demonstrate x402-based agent commerce

---

# ✨ Key Features

## 💳 1. Digital Wallet

Users can view:

- Available balance
- Wallet address
- Account information
- Payment status

The application uses an Algorand TestNet wallet for blockchain-related functionality.

---

## 💸 2. Send Money

Users can send payments to other users.

The payment flow includes:

1. Select recipient
2. Enter payment amount
3. Validate transaction
4. Perform fraud/risk checks
5. Apply spending policies
6. Authorize the payment
7. Execute the transaction

---

## 🤖 3. AI Payment Assistant

BlockPay AI integrates **Google Gemini AI** to provide intelligent payment assistance.

Users can ask questions such as:

> "Should I send ₹5,000 to this recipient?"

The AI assistant can provide contextual recommendations based on the available transaction information.

---

## 🛡️ 4. AI Fraud Detection

Transactions can be analyzed before execution.

The system considers transaction-related information and provides a fraud/risk assessment.

This helps users identify potentially suspicious payments before confirming them.

---

## ⚙️ 5. Policy Engine

Users can configure payment policies such as:

- Daily spending limit
- Individual transaction limit
- Monthly spending limit
- High-risk transaction threshold
- Blocked accounts
- Trusted accounts

The backend validates transactions against these policies before processing payments.

---

## 📱 6. QR Payments

BlockPay AI supports QR-based payments.

### Generate QR

Users can generate a QR code containing payment information.

### Scan QR

Users can scan another user's QR code to retrieve payment information and initiate a transaction.

---

## ⛓️ 7. Algorand Blockchain

The project uses the **Algorand TestNet** for blockchain functionality.

Blockchain-related functionality includes:

- Wallet addresses
- Transaction creation
- Transaction verification
- Blockchain status
- Explorer functionality

The TestNet is used for demonstration purposes and does not involve real funds.

---

## 🤝 8. x402 Agent Commerce

BlockPay AI includes an x402 service demonstrating the concept of **HTTP-based payment authorization for agent commerce**.

This allows the project to explore how AI agents and applications can interact with programmable payment infrastructure.

The x402 functionality is implemented through:


services/x402Service.ts
📊 9. Spending Analytics

Users can visualize their spending through interactive dashboards.

Analytics include:

Category breakdown
Daily spending
Spending limits
Transaction activity
📜 10. Transaction History

Users can view previous payment activity through the transaction history interface.

The application maintains transaction-related information for monitoring and auditing.

🧾 11. PDF Transaction Reports

The application includes PDF generation functionality.

Users can generate transaction reports for record keeping.

Implementation:

src/utils/pdfGenerator.ts
📩 12. SMS Notifications

The project includes an SMS functionality layer for payment-related notifications.

The backend contains SMS handling logic for sending payment alerts.

🔐 13. Audit Logging

The project contains an audit service for tracking important application and transaction events.

Implementation:

services/auditService.ts
🏗️ System Architecture
                         ┌─────────────────────┐
                         │       User          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ React + TypeScript  │
                         │      Frontend       │
                         │      Vercel         │
                         └──────────┬──────────┘
                                    │
                              HTTPS REST API
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Node.js + Express   │
                         │      Backend        │
                         │       Render        │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
       │ Gemini AI   │      │  Algorand   │      │   Policy    │
       │             │      │  TestNet    │      │   Engine    │
       └─────────────┘      └─────────────┘      └─────────────┘
              │                     │                     │
              └─────────────────────┼─────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Payment / Audit /  │
                         │ Transaction Layer  │
                         └─────────────────────┘
🛠️ Technology Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
Lucide React
Recharts
QR Code libraries
jsPDF
Backend
Node.js
Express.js
TypeScript
TSX
CORS
dotenv
Artificial Intelligence
Google Gemini API
Blockchain
Algorand
Algorand TestNet
Payment / Agent Commerce
x402 service
Development
Visual Studio Code
Git
GitHub
npm
Deployment
Vercel — Frontend
Render — Backend
📁 Project Structure
finalblockchain/
│
├── public/
│   └── favicon.ico
│
├── scripts/
│   └── createWallet.ts
│
├── services/
│   ├── algorandService.ts
│   ├── auditService.ts
│   ├── policyEngine.ts
│   └── x402Service.ts
│
├── src/
│   ├── components/
│   │   ├── AIAgentAssistantModal.tsx
│   │   ├── BalanceCard.tsx
│   │   ├── BlockchainExplorer.tsx
│   │   ├── LoginModal.tsx
│   │   ├── MyQRModal.tsx
│   │   ├── Navbar.tsx
│   │   ├── PolicyEngineModal.tsx
│   │   ├── ProfileView.tsx
│   │   ├── QRCodeGenerator.tsx
│   │   ├── QRScannerModal.tsx
│   │   ├── QuickActions.tsx
│   │   ├── SMSDrawer.tsx
│   │   ├── SendMoneyModal.tsx
│   │   ├── SpendingAnalytics.tsx
│   │   └── TransactionHistory.tsx
│   │
│   ├── utils/
│   │   ├── api.ts
│   │   └── pdfGenerator.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── server.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── metadata.json
└── README.md
🔄 Payment Flow
User
 │
 ▼
Enter Payment Details
 │
 ▼
Recipient Validation
 │
 ▼
Fraud / Risk Analysis
 │
 ▼
Policy Engine
 │
 ├── Policy Failed ──► Reject Transaction
 │
 └── Policy Passed
          │
          ▼
     Payment Authorization
          │
          ▼
     Payment Execution
          │
          ▼
     Algorand TestNet
          │
          ▼
     Transaction Record
          │
          ▼
     User Confirmation
🤖 AI Payment Flow
User Question
      │
      ▼
AI Payment Assistant
      │
      ▼
Gemini AI
      │
      ▼
Transaction Context
      │
      ▼
Risk / Recommendation
      │
      ▼
User Decision
🔐 Security Features

BlockPay AI includes multiple security layers:

OTP-based authentication
Spending limits
Transaction limits
Monthly limits
Fraud/risk analysis
Blocked accounts
Trusted accounts
Audit logging
Blockchain transaction verification
Environment variables for sensitive configuration
🌐 Deployment
Frontend

The React frontend is deployed using Vercel.

https://blockchainhacathon.vercel.app/
Backend

The Node.js/Express backend is deployed using Render.

https://blockchainhacathon.onrender.com

Example API:

https://blockchainhacathon.onrender.com/api/users
⚙️ Local Setup
1. Clone the repository
git clone https://github.com/Manaswi1106/blockchainhacathon.git
cd blockchainhacathon
2. Install dependencies
npm install
3. Configure environment variables

Create a .env file based on:

.env.example

Add the required API keys and configuration values.

Do not commit secret API keys to GitHub.

4. Start development
npm run dev

The development setup runs the frontend and backend together.

5. Frontend only
npm run frontend

The Vite development server will run on:

http://localhost:5173
6. Backend only
npm run server

The Express backend runs using the configured server port.

🏗️ Production Build

Build the frontend and backend:

npm run build

Start the production server:

npm start
🧪 Test Environment

The application uses Algorand TestNet / simulation mode for the hackathon demonstration.

No real financial funds are transferred.

🚀 Future Enhancements

Potential future improvements include:

Real UPI integration
Real banking API integration
Merchant payment support
Advanced merchant trust scores
Multi-chain blockchain support
Voice-based payment assistant
Face authentication
Real-time fraud models
Production-grade database integration
Autonomous AI agent payments
Advanced financial insights
👥 Hackathon Highlights

BlockPay AI demonstrates the integration of:

🤖 Artificial Intelligence

Intelligent payment assistance and transaction analysis.

⛓️ Blockchain

Transparent and verifiable payment infrastructure using Algorand TestNet.

💳 FinTech

Digital wallet, payment processing, QR payments and transaction management.

🛡️ Security

Fraud detection, OTP authentication, spending policies and audit logging.

🤝 AI Agent Commerce

x402-based payment functionality exploring machine-to-machine and AI-agent payments.

📌 Project Links
Live Application

https://blockchainhacathon.vercel.app/

Backend API

https://blockchainhacathon.onrender.com/api/users

GitHub Repository

https://github.com/Manaswi1106/blockchainhacathon
