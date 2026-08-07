import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { checkPaymentPolicy } from "./services/policyEngine";
const app = express();
const PORT = 3000;

import {
  createAlgorandTransaction,
  getBlockchainStatus
} from "./services/algorandService";
app.use(express.json());
import {
  createAuditLog,
  getAuditLogs
} from "./services/auditService";
import { authorizeX402Payment } from "./services/x402Service";
// Initialize Gemini AI Client if GEMINI_API_KEY is available
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Robust helper to invoke Gemini AI with automatic model fallback and error suppression
async function generateAiText(prompt: string): Promise<string | null> {
  if (!ai) return null;
  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      if (response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      const isQuotaOr404 =
        err?.status === 429 ||
        err?.status === 404 ||
        err?.message?.includes("quota") ||
        err?.message?.includes("RESOURCE_EXHAUSTED") ||
        err?.message?.includes("no longer available");
      
      if (!isQuotaOr404) {
        console.warn(`[Gemini AI] ${modelName} note: ${err?.message || err}.`);
      }
    }
  }
  return null;
}

// Initial Seed Data for Demo Accounts
const INITIAL_USERS = [
  {
    id: "user_1",
    name: "Manu Sharma",
    upiId: "manu@ibl",
    accountNumber: "842615783429",
    phone: "9347868283",
    pin: "4598",
    balance: 25000,
    walletAddress: "MANU778899001122334455667788990011223344556677889900ALGO",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    policy: {
      dailyLimit: 100000,
      transactionLimit: 50000,
      monthlyLimit: 500000,
      highRiskThreshold: 75,
      blockedAccounts: ["scammer@blockpay"],
      trustedAccounts: ["saha@ibl", "sahasra@blockpay", "coffee@ibl"]
    }
  },
  {
    id: "user_2",
    name: "Sahasra Kona",
    upiId: "saha@ibl",
    accountNumber: "758923416812",
    phone: "8688187443",
    pin: "7284",
    balance: 18500,
    walletAddress: "SAHA1122334455667788990011223344556677889900112233ALGO",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    policy: {
      dailyLimit: 80000,
      transactionLimit: 30000,
      monthlyLimit: 400000,
      highRiskThreshold: 70,
      blockedAccounts: [],
      trustedAccounts: ["manu@ibl", "manu@blockpay"]
    }
  }
];

// Initial Seed Transactions
const INITIAL_TRANSACTIONS = [
  {
    id: "TXN_9841201",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    senderId: "user_1",
    senderName: "Manu Sharma",
    senderUpi: "manu@ibl",
    receiverId: "user_2",
    receiverName: "Sahasra Kona",
    receiverUpi: "saha@ibl",
    amount: 500,
    note: "Lunch split & coffee ☕",
    status: "SUCCESS",
    category: "Food",
    algoTxHash: "ALGO_TX_89F12A4B92C3E71D0041289123485012391A0",
    algoBlockNumber: 38491201,
    x402Token: "x402_auth_tok_89f12a4b_ver1",
    aiRiskLevel: "LOW",
    aiRiskScore: 12,
    aiReason: "Payment is well within daily limit. Recipient is in trusted contacts.",
    policyPassed: true,
    smsRef: "SMS9841201"
  },
  {
    id: "TXN_9840912",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    senderId: "user_2",
    senderName: "Sahasra Kona",
    senderUpi: "saha@ibl",
    receiverId: "user_1",
    receiverName: "Manu Sharma",
    receiverUpi: "manu@ibl",
    amount: 1200,
    note: "Concert ticket repayment",
    status: "SUCCESS",
    category: "Entertainment",
    algoTxHash: "ALGO_TX_77B19C01A9248E5102931481230491823091B",
    algoBlockNumber: 38490800,
    x402Token: "x402_auth_tok_77b19c01_ver1",
    aiRiskLevel: "LOW",
    aiRiskScore: 8,
    aiReason: "Standard interpersonal transfer between connected accounts.",
    policyPassed: true,
    smsRef: "SMS9840912"
  },
  {
    id: "TXN_9839500",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    senderId: "user_1",
    senderName: "Manu Sharma",
    senderUpi: "manu@ibl",
    receiverId: "merchant_ai",
    receiverName: "Agent Compute API",
    receiverUpi: "agent_compute@blockpay",
    amount: 150,
    note: "x402 Agent API Inference Call",
    status: "SUCCESS",
    category: "AI Service",
    algoTxHash: "ALGO_TX_12D99A10F827411C29837129847192837410C",
    algoBlockNumber: 38489110,
    x402Token: "x402_auth_tok_12d99a10_ver1",
    aiRiskLevel: "LOW",
    aiRiskScore: 15,
    aiReason: "Automated x402 payment authorized for verified AI Agent provider.",
    policyPassed: true,
    smsRef: "SMS9839500"
  }
];

// Initial Algorand Blocks
const INITIAL_BLOCKS = [
  {
    blockNumber: 38491204,
    hash: "BLK_ALGO_9918237129837198273918273918273918273918",
    timestamp: new Date().toISOString(),
    txCount: 4,
    proposer: "ALGO_NODE_ASIA_EAST_01",
    fee: "0.001 ALGO"
  },
  {
    blockNumber: 38491203,
    hash: "BLK_ALGO_8817263514231412341234123412341234123412",
    timestamp: new Date(Date.now() - 3300).toISOString(),
    txCount: 3,
    proposer: "ALGO_NODE_EU_WEST_02",
    fee: "0.001 ALGO"
  },
  {
    blockNumber: 38491202,
    hash: "BLK_ALGO_7716151413121110090807060504030201009988",
    timestamp: new Date(Date.now() - 6600).toISOString(),
    txCount: 6,
    proposer: "ALGO_NODE_US_EAST_04",
    fee: "0.001 ALGO"
  }
];

// Initial SMS
const INITIAL_SMS = [
  {
    id: "sms_1",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: "user_1",
    phone: "9347868283",
    message: "BlockPay Alert: Your account XXXX3429 has been debited ₹500 for payment to Sahasra Kona (saha@ibl). Ref: TXN_9841201. Available balance: ₹25,000.",
    type: "DEBIT",
    refNumber: "TXN_9841201",
    isRead: true
  },
  {
    id: "sms_2",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: "user_2",
    phone: "8688187443",
    message: "BlockPay Alert: ₹500 received in your account XXXX6812 from Manu Sharma (manu@ibl). Ref: TXN_9841201. Available balance: ₹18,500.",
    type: "CREDIT",
    refNumber: "TXN_9841201",
    isRead: false
  }
];

// In-Memory Database State
let users = [...INITIAL_USERS];
let transactions = [...INITIAL_TRANSACTIONS];
let blocks = [...INITIAL_BLOCKS];
let smsList = [...INITIAL_SMS];
let otpStore: Record<string, string> = {};

// Real SMS Dispatcher Helper (Fast2SMS / Twilio Integration)
async function dispatchRealSms(phoneNumber: string, message: string) {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone}`;
  console.log(`[SMS DISPATCH] Carrier SMS triggered for ${formattedPhone}: "${message}"`);

  // 1. Fast2SMS Integration
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "v3",
          sender_id: "TXTIND",
          message: message,
          language: "english",
          flash: 0,
          numbers: cleanPhone.slice(-10),
        }),
      });
      const data = await response.json();
      console.log("[SMS FAST2SMS RESULT]", data);
    } catch (err) {
      console.error("[SMS FAST2SMS ERROR]", err);
    }
  }

  // 2. Twilio Integration
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;
      const auth = Buffer.from(`${sid}:${token}`).toString("base64");

      const bodyParams = new URLSearchParams();
      bodyParams.append("To", formattedPhone);
      bodyParams.append("From", from);
      bodyParams.append("Body", message);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: bodyParams.toString(),
      });
      const data = await response.json();
      console.log("[SMS TWILIO RESULT]", data);
    } catch (err) {
      console.error("[SMS TWILIO ERROR]", err);
    }
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// GET /api/users - Get all users
app.get("/api/users", (req, res) => {
  res.json({ success: true, users });
});

// GET /api/users/:id - Get specific user
app.get("/api/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id || u.phone === req.params.id || u.upiId === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }
  res.json({ success: true, user });
});

// POST /api/auth/otp - Send OTP to phone number
app.post("/api/auth/otp", (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: "Phone number required" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[phone] = otp;

  // Add SMS entry for OTP
  const user = users.find((u) => u.phone === phone);
  const smsEntry = {
    id: "sms_otp_" + Date.now(),
    timestamp: new Date().toISOString(),
    userId: user ? user.id : "guest",
    phone,
    message: `Your BlockPay verification code is ${otp}. Do not share this OTP with anyone.`,
    type: "OTP" as const,
    refNumber: "OTP_" + otp,
    isRead: false,
  };
  smsList.unshift(smsEntry);
  dispatchRealSms(phone, smsEntry.message);

  res.json({
    success: true,
    message: `OTP sent to +91 ${phone}`,
    otp, // Returned for simulation display ease
    sms: smsEntry,
  });
});

// POST /api/auth/verify-otp - Verify OTP and login
app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  const validOtp = otpStore[phone];

  if (!validOtp || validOtp !== otp) {
    return res.status(400).json({ success: false, error: "Invalid OTP code" });
  }

  delete otpStore[phone];
  let user = users.find((u) => u.phone === phone);

  if (!user) {
    // Auto-create account for new phone in simulation
    user = {
      id: "user_" + Date.now(),
      name: "User " + phone.slice(-4),
      upiId: `user${phone.slice(-4)}@blockpay`,
      accountNumber: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      phone,
      pin: "1234",
      balance: 10000,
      walletAddress: `ALGO${phone}889900112233445566778899001122ALGO`,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250",
      policy: {
        dailyLimit: 50000,
        transactionLimit: 20000,
        monthlyLimit: 200000,
        highRiskThreshold: 75,
        blockedAccounts: [],
        trustedAccounts: ["sahasra@blockpay", "friend@blockpay"],
      },
    };
    users.push(user);
  }

  res.json({ success: true, user });
});

// POST /api/users/update-pin - Change UPI PIN
app.post("/api/users/update-pin", (req, res) => {
  const { userId, currentPin, newPin } = req.body;
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  if (user.pin !== currentPin) {
    return res.status(400).json({ success: false, error: "Incorrect current UPI PIN" });
  }

  user.pin = newPin;
  res.json({ success: true, message: "UPI PIN updated successfully" });
});

// POST /api/users/update-policy - Update policy settings
app.post("/api/users/update-policy", (req, res) => {
  const { userId, policy } = req.body;
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  user.policy = { ...user.policy, ...policy };
  res.json({ success: true, policy: user.policy });
});

// POST /api/pay/fraud-check - AI Fraud Evaluation with Gemini 3.6 Flash
app.post("/api/pay/fraud-check", async (req, res) => {
  const { senderId, receiverUpi, amount, note } = req.body;
  const sender = users.find((u) => u.id === senderId) || users[0];

  // Compute stats
  const todayTx = transactions.filter(
    (t) =>
      t.senderId === sender?.id &&
      new Date(t.timestamp).toDateString() === new Date().toDateString()
  );
  const todaySpent = todayTx.reduce((sum, t) => sum + t.amount, 0);

  const isBlocked = sender?.policy.blockedAccounts.includes(receiverUpi);
  const isTrusted = sender?.policy.trustedAccounts.includes(receiverUpi);
  const exceedsTxLimit = amount > (sender?.policy.transactionLimit || 50000);
  const exceedsDailyLimit = todaySpent + amount > (sender?.policy.dailyLimit || 100000);

  // Default heuristic evaluation
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let riskScore = 10;
  let reason = "Transaction parameters are within normal security policy bounds.";

  if (isBlocked) {
    riskLevel = "HIGH";
    riskScore = 95;
    reason = "Recipient account is explicitly listed on the user's blocked security list.";
  } else if (exceedsDailyLimit) {
    riskLevel = "HIGH";
    riskScore = 88;
    reason = `Payment violates daily limit. Today's total would reach ₹${todaySpent + amount} (Limit: ₹${sender?.policy.dailyLimit}).`;
  } else if (exceedsTxLimit) {
    riskLevel = "MEDIUM";
    riskScore = 65;
    reason = `Amount ₹${amount} exceeds single transaction policy limit of ₹${sender?.policy.transactionLimit}.`;
  } else if (amount > 15000 && !isTrusted) {
    riskLevel = "MEDIUM";
    riskScore = 52;
    reason = `Large payment amount to an unverified recipient. Pre-authorization advised.`;
  } else if (isTrusted) {
    riskLevel = "LOW";
    riskScore = 5;
    reason = "Recipient is a verified trusted account. Low probability of fraud.";
  }

  // Fast & resilient AI check with 1.2s timeout or instant fallback
  if (ai) {
    try {
      const prompt = `Analyze this simulated digital payment for fraud and security risk:
- Sender Name: ${sender?.name || "User"}
- Sender UPI: ${sender?.upiId || "sahasra@blockpay"}
- Recipient UPI: ${receiverUpi}
- Amount: ₹${amount}
- Note: "${note || "No note"}"

Provide a brief, realistic 1-sentence AI security assessment explaining whether this transaction appears safe or moderate risk. Keep it professional.`;

      const aiPromise = generateAiText(prompt);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
      const aiText = await Promise.race([aiPromise, timeoutPromise]);
      if (aiText) {
        reason = aiText;
      }
    } catch (err) {
      console.warn('[Fraud Check AI Fallback]', err);
    }
  }

  res.json({
    success: true,
    riskLevel,
    riskScore,
    reason,
    policyChecks: {
      dailyLimitOk: !exceedsDailyLimit,
      txLimitOk: !exceedsTxLimit,
      recipientTrusted: isTrusted,
      isBlocked: !!isBlocked,
    },
  });
});

// POST /api/x402/authorize - x402 Protocol Header Simulation
app.post("/api/x402/authorize", (req, res) => {
  const { amount, senderUpi, receiverUpi } = req.body;

  // Simulate x402 Protocol headers
  const x402Headers = {
    "HTTP-Status": "402 Payment Required",
    "X-402-Protocol": "x402-v1-agent-commerce",
    "X-402-Amount-INR": amount,
    "X-402-Sender-UPI": senderUpi,
    "X-402-Merchant-UPI": receiverUpi,
    "X-402-Nonce": "nonce_" + Math.random().toString(36).substring(2, 10),
    "X-402-Timestamp": new Date().toISOString(),
    "X-402-Network": "algorand-testnet",
  };

  const paymentToken = `x402_auth_tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

  res.json({
    status: 402,
    protocol: "x402",
    headers: x402Headers,
    paymentToken,
    message: "x402 Payment Required challenge generated and signed.",
  });
});

// POST /api/pay/execute - Execute payment simulation across MongoDB, Algorand & x402
app.post("/api/pay/execute", async (req, res) => {
  const { senderId, receiverUpi, amount, note, pin } = req.body;

  const sender = users.find((u) => u.id === senderId) || users[0];

  // 1. Verify UPI PIN (accept user's PIN or standard 1234 or any 4-digit numeric PIN for demo)
  if (sender.pin && sender.pin !== pin && pin !== "1234") {
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ success: false, error: "INCORRECT_PIN", message: "Invalid UPI PIN. Please enter a 4-digit PIN." });
    }
  }

  // 2. Check Balance
  if (sender.balance < amount) {
    return res.status(400).json({ success: false, error: "INSUFFICIENT_FUNDS", message: "Insufficient account balance." });
  }

  // Find Receiver
  const rInput = (receiverUpi || "").toLowerCase();
  let receiver = users.find(
    (u) =>
      u.upiId.toLowerCase() === rInput ||
      u.phone === receiverUpi ||
      u.accountNumber === receiverUpi ||
      (rInput.includes("manu") && u.upiId.includes("manu")) ||
      (rInput.includes("saha") && u.upiId.includes("saha"))
  );
  const receiverName = receiver ? receiver.name : receiverUpi.split("@")[0] || "Merchant";
  const receiverId = receiver ? receiver.id : "merchant_" + Date.now();

  // 3. Check Policy
  const todayTx = transactions.filter(
  (t) =>
    t.senderId === senderId &&
    new Date(t.timestamp).toDateString() ===
      new Date().toDateString()
);

const todaySpent = todayTx.reduce(
  (sum, t) => sum + t.amount,
  0
);

const policyResult = checkPaymentPolicy(
  amount,
  receiverUpi,
  sender.policy,
  todaySpent
);

if (!policyResult.approved) {
  return res.status(403).json({
    success: false,
    error: "POLICY_REJECTED",
    message: policyResult.reason,
  });
}

  // 4. Update Balances in MongoDB state
  sender.balance -= amount;
  if (receiver) {
    receiver.balance += amount;
  }

  // 5. Generate Algorand TestNet Transaction Hash & Block
  const algoResponse = await createAlgorandTransaction(
    sender.upiId,
    receiverUpi,
    amount
);

const algoTxHash = algoResponse.txId;

const latestBlockNum = algoResponse.blockNumber;

const newBlock = {
    blockNumber: algoResponse.blockNumber,
    hash: algoResponse.blockHash,
    timestamp: algoResponse.timestamp,
    txCount: 1,
    proposer: "ALGORAND_TESTNET",
    fee: algoResponse.fee
};

blocks.unshift(newBlock);
  // 6. Generate x402 Payment Token
 const x402Response = await authorizeX402Payment({
    amount,
    sender: sender.upiId,
    receiver: receiverUpi,
    purpose: note
});

const x402Token = x402Response.paymentToken;

  // 7. Create Transaction Record
  const txnId = "TXN_" + Math.floor(1000000 + Math.random() * 9000000);
  const transaction = {
    id: txnId,
    timestamp: new Date().toISOString(),
    senderId: sender.id,
    senderName: sender.name,
    senderUpi: sender.upiId,
    receiverId,
    receiverName,
    receiverUpi,
    amount,
    note: note || "UPI Payment",
    status: "SUCCESS" as const,
    category: note?.toLowerCase().includes("food")
      ? "Food"
      : note?.toLowerCase().includes("coffee")
      ? "Food"
      : note?.toLowerCase().includes("repay")
      ? "Transfer"
      : "Shopping",
    algoTxHash,
    algoBlockNumber: latestBlockNum,
    x402Token,
    aiRiskLevel: "LOW" as const,
    aiRiskScore: 10,
    aiReason: "Payment verified through x402 protocol & Algorand TestNet consensus.",
    policyPassed: true,
    smsRef: "SMS" + txnId.replace("TXN_", ""),
  };

  transactions.unshift(transaction);
createAuditLog(
    "PAYMENT",
    "SUCCESS",
    sender.upiId,
    {
        transactionId: txnId,
        receiver: receiverUpi,
        amount,
        blockchainHash: algoTxHash,
        x402Token
    }
);

  // 8. Generate SMS for Sender & Receiver
  const senderSms = {
    id: "sms_s_" + Date.now(),
    timestamp: new Date().toISOString(),
    userId: sender.id,
    phone: sender.phone,
    message: `BlockPay Alert: Your account XXXX${sender.accountNumber.slice(-4)} has been debited ₹${amount} for payment to ${receiverName}. Ref: ${txnId}. Available Balance: ₹${sender.balance}.`,
    type: "DEBIT" as const,
    refNumber: txnId,
    isRead: false,
  };
  smsList.unshift(senderSms);
  dispatchRealSms(sender.phone, senderSms.message);

  let receiverSms = null;
  if (receiver) {
    receiverSms = {
      id: "sms_r_" + Date.now(),
      timestamp: new Date().toISOString(),
      userId: receiver.id,
      phone: receiver.phone,
      message: `BlockPay Alert: ₹${amount} received in your account XXXX${receiver.accountNumber.slice(-4)} from ${sender.name}. Ref: ${txnId}. Available Balance: ₹${receiver.balance}.`,
      type: "CREDIT" as const,
      refNumber: txnId,
      isRead: false,
    };
    smsList.unshift(receiverSms);
    dispatchRealSms(receiver.phone, receiverSms.message);
  }

  res.json({
    success: true,
    transaction,
    senderBalance: sender.balance,
    block: newBlock,
    sms: [senderSms, receiverSms].filter(Boolean),
  });
});

// GET /api/transactions - Get transactions for user
app.get("/api/transactions", (req, res) => {
  const { userId } = req.query;
  let userTx = transactions;
  if (userId) {
    userTx = transactions.filter(
      (t) => t.senderId === userId || t.receiverId === userId || t.senderUpi === userId || t.receiverUpi === userId
    );
  }
  res.json({ success: true, transactions: userTx });
});

// GET /api/blockchain/stats - Blockchain Explorer Data
app.get("/api/blockchain/stats", (req, res) => {
  res.json({
    success: true,
    network: "Algorand TestNet",
    status: "Healthy",
    tps: 1240,
    avgBlockTime: "3.3s",
    latestBlock: blocks[0]?.blockNumber || 38491204,
    gasFee: "0.001 ALGO",
    blocks: blocks.slice(0, 20),
    transactions: transactions.slice(0, 20),
  });
});

// GET /api/sms - Fetch SMS history
app.get("/api/sms", (req, res) => {
  const { userId, phone } = req.query;
  let userSms = smsList;
  if (userId || phone) {
    userSms = smsList.filter((s) => s.userId === userId || s.phone === phone);
  }
  res.json({ success: true, smsList: userSms });
});
// GET /api/audit - Get Audit Logs
app.get("/api/audit", (req, res) => {
  res.json({
    success: true,
    logs: getAuditLogs()
  });
});

// POST /api/agent/chat - Gemini powered Agent AI Assistant
app.post("/api/agent/chat", async (req, res) => {
  const { message, userId } = req.body;
  const user = users.find((u) => u.id === userId) || users[0];

  let reply = "I am your BlockPay AI Agent Assistant. I can help you check balances, analyze spending, or structure x402 payment requests.";

  if (ai) {
    const prompt = `You are BlockPay AI, an intelligent agent commerce payment assistant inside a simulated UPI & Algorand blockchain application.
User Profile:
- Name: ${user.name}
- UPI ID: ${user.upiId}
- Balance: ₹${user.balance}
- Daily Limit: ₹${user.policy.dailyLimit}

User query: "${message}"

Give a concise, smart, and helpful response. If the user asks to send money, state that you can pre-fill the x402 payment form for them. Keep it friendly and concise under 3 sentences.`;

    const aiReply = await generateAiText(prompt);
    if (aiReply) {
      reply = aiReply;
    } else {
      // Rule fallback if AI is experiencing temporary high demand
      if (message.toLowerCase().includes("balance")) {
        reply = `Your current available balance is ₹${user.balance.toLocaleString('en-IN')}.`;
      } else if (message.toLowerCase().includes("pay") || message.toLowerCase().includes("send")) {
        reply = `I can help you prepare an x402 transaction! Please specify the recipient UPI ID and amount.`;
      }
    }
  } else {
    // Fallback bot replies
    if (message.toLowerCase().includes("balance")) {
      reply = `Your current available balance is ₹${user.balance.toLocaleString('en-IN')}.`;
    } else if (message.toLowerCase().includes("pay") || message.toLowerCase().includes("send")) {
      reply = `I can help you prepare an x402 transaction! Please specify the recipient UPI ID and amount.`;
    }
  }

  res.json({ success: true, reply });
});

// ----------------------------------------------------
// VITE & STATIC FILES MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BlockPay AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
