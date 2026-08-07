export interface SpendingPolicy {
  dailyLimit: number;
  transactionLimit: number;
  monthlyLimit: number;
  highRiskThreshold: number;
  blockedAccounts: string[];
  trustedAccounts: string[];
}

export interface UserAccount {
  id: string;
  name: string;
  upiId: string;
  accountNumber: string;
  phone: string;
  pin: string;
  balance: number;
  walletAddress: string;
  avatar: string;
  policy: SpendingPolicy;
}

export interface PaymentTransaction {
  id: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderUpi: string;
  receiverId: string;
  receiverName: string;
  receiverUpi: string;
  amount: number;
  note: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
  category: string;
  algoTxHash: string;
  algoBlockNumber: number;
  x402Token: string;
  aiRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  aiRiskScore: number;
  aiReason: string;
  policyPassed: boolean;
  smsRef: string;
}

export interface AlgorandBlock {
  blockNumber: number;
  hash: string;
  timestamp: string;
  txCount: number;
  proposer: string;
  fee: string;
}

export interface SMSNotification {
  id: string;
  timestamp: string;
  userId: string;
  phone: string;
  message: string;
  type: 'DEBIT' | 'CREDIT' | 'OTP' | 'SECURITY';
  refNumber: string;
  isRead: boolean;
}

export interface FraudAnalysisResult {
  success: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  reason: string;
  policyChecks: {
    dailyLimitOk: boolean;
    txLimitOk: boolean;
    recipientTrusted: boolean;
    isBlocked: boolean;
  };
}

export type ActiveTab = 'dashboard' | 'history' | 'blockchain' | 'agent' | 'profile' | 'policy';
