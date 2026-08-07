export interface PaymentPolicy {
  dailyLimit: number;
  transactionLimit: number;
  monthlyLimit: number;
  highRiskThreshold: number;
  blockedAccounts: string[];
  trustedAccounts: string[];
}

export interface PolicyResult {
  approved: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reason: string;
}

export function checkPaymentPolicy(
  amount: number,
  receiverUpi: string,
  policy: PaymentPolicy,
  todaySpent: number
): PolicyResult {

  // Blocked account
  if (policy.blockedAccounts.includes(receiverUpi)) {
    return {
      approved: false,
      riskLevel: "HIGH",
      reason: "Recipient is blocked."
    };
  }

  // Transaction limit
  if (amount > policy.transactionLimit) {
    return {
      approved: false,
      riskLevel: "HIGH",
      reason: `Transaction exceeds ₹${policy.transactionLimit} limit.`
    };
  }

  // Daily limit
  if (todaySpent + amount > policy.dailyLimit) {
    return {
      approved: false,
      riskLevel: "HIGH",
      reason: `Daily limit of ₹${policy.dailyLimit} exceeded.`
    };
  }

  // Trusted account
  if (policy.trustedAccounts.includes(receiverUpi)) {
    return {
      approved: true,
      riskLevel: "LOW",
      reason: "Trusted recipient."
    };
  }

  // Medium risk
  if (amount > policy.highRiskThreshold) {
    return {
      approved: true,
      riskLevel: "MEDIUM",
      reason: "High-value transaction."
    };
  }

  return {
    approved: true,
    riskLevel: "LOW",
    reason: "Policy check passed."
  };
}