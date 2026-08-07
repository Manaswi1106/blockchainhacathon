export interface X402PaymentRequest {
  amount: number;
  sender: string;
  receiver: string;
  purpose?: string;
}

export interface X402PaymentResponse {
  approved: boolean;
  status: number;
  protocol: string;
  paymentToken: string;
  message: string;
  timestamp: string;
}

export async function authorizeX402Payment(
  request: X402PaymentRequest
): Promise<X402PaymentResponse> {

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const paymentToken =
    "x402_demo_" +
    Math.random().toString(36).substring(2, 10).toUpperCase();

  return {
    approved: true,
    status: 402,
    protocol: "x402",
    paymentToken,
    message: "Payment authorized successfully.",
    timestamp: new Date().toISOString()
  };
}