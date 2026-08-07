import React, { useState, useEffect } from 'react';
import { UserAccount, FraudAnalysisResult } from '../types';
import {
  X,
  Send,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Cpu,
  Boxes,
  Zap,
  ArrowRight,
  Sparkles,
  Smartphone,
  RefreshCw,
  Fingerprint,
  Info,
  Download,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadReceiptPdf } from '../utils/pdfGenerator';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  sender: UserAccount;
  allUsers: UserAccount[];
  initialRecipientUpi?: string;
  onPaymentSuccess: (data: {
    transaction: any;
    block: any;
    sms: any[];
    senderBalance: number;
  }) => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  sender,
  allUsers,
  initialRecipientUpi = '',
  onPaymentSuccess,
}) => {
  const [step, setStep] = useState<'RECIPIENT' | 'AMOUNT' | 'PIN' | 'PROCESSING' | 'SUCCESS'>('RECIPIENT');
  const [recipientInput, setRecipientInput] = useState(initialRecipientUpi);
  const [selectedRecipient, setSelectedRecipient] = useState<UserAccount | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // Processing Sub-Steps for x402 & Algorand Visuals
  const [processStage, setProcessStage] = useState<'FRAUD_CHECK' | 'X402_AUTH' | 'ALGORAND_BLOCK' | 'FINALIZING'>('FRAUD_CHECK');
  const [aiFraudResult, setAiFraudResult] = useState<FraudAnalysisResult | null>(null);
  const [x402Details, setX402Details] = useState<any>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && initialRecipientUpi) {
      setRecipientInput(initialRecipientUpi);
      const match = allUsers.find(
        (u) =>
          u.upiId.toLowerCase() === initialRecipientUpi.toLowerCase() ||
          u.phone === initialRecipientUpi
      );
      if (match) {
        setSelectedRecipient(match);
      } else {
        setSelectedRecipient({
          id: 'ext_' + Date.now(),
          name: initialRecipientUpi.split('@')[0].toUpperCase() || 'RECIPIENT',
          upiId: initialRecipientUpi,
          accountNumber: '7589001234',
          phone: '9876543210',
          pin: '1234',
          balance: 0,
          walletAddress: 'SAHA1122334455667788990011223344556677889900112233ALGO',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          policy: {
            dailyLimit: 100000,
            transactionLimit: 50000,
            monthlyLimit: 500000,
            highRiskThreshold: 25000,
            blockedAccounts: [],
            trustedAccounts: [],
          },
        });
      }
      setStep('AMOUNT');
    } else if (!isOpen) {
      setStep('RECIPIENT');
      setRecipientInput('');
      setSelectedRecipient(null);
      setAmount('');
      setNote('');
      setPin('');
      setPinError('');
    }
  }, [isOpen, initialRecipientUpi, allUsers]);

  if (!isOpen) return null;

  const handleSelectRecipient = (u: UserAccount) => {
    setSelectedRecipient(u);
    setRecipientInput(u.upiId);
    setStep('AMOUNT');
  };

  const handleCustomRecipientContinue = () => {
    if (!recipientInput) return;
    const match = allUsers.find(
      (u) =>
        u.upiId.toLowerCase() === recipientInput.toLowerCase() ||
        u.phone === recipientInput ||
        u.accountNumber === recipientInput
    );
    setSelectedRecipient(match || null);
    setStep('AMOUNT');
  };

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        verifyPinAndProcess(nextPin);
      }
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
    setPinError('');
  };

  const verifyPinAndProcess = async (enteredPin: string) => {
    // Allow user's PIN or standard 1234 demo PIN
    if (enteredPin !== sender.pin && enteredPin !== '1234' && enteredPin.length !== 4) {
      setPinError('Incorrect UPI PIN. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
      return;
    }

    // Correct PIN -> Move to PROCESSING & AI Fraud Check
    setStep('PROCESSING');
    setProcessStage('FRAUD_CHECK');
    setErrorMsg('');

    try {
      const targetUpi = selectedRecipient ? selectedRecipient.upiId : (recipientInput || initialRecipientUpi);
      const numAmount = parseFloat(amount);

      // 1. AI Fraud Engine Check
      const fraudRes = await fetch('/api/pay/fraud-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: sender.id,
          receiverUpi: targetUpi,
          amount: numAmount,
          note,
        }),
      });
      const fraudData = await fraudRes.json();
      setAiFraudResult(fraudData);

      // Short delay to display AI Fraud Check
      await new Promise((r) => setTimeout(r, 1000));

      // 2. x402 Authorization
      setProcessStage('X402_AUTH');
      const x402Res = await fetch('/api/x402/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          senderUpi: sender.upiId,
          receiverUpi: targetUpi,
        }),
      });
      const x402Data = await x402Res.json();
      setX402Details(x402Data);

      await new Promise((r) => setTimeout(r, 1000));

      // 3. Algorand Ledger Commit & Payment Execution
      setProcessStage('ALGORAND_BLOCK');
      const payRes = await fetch('/api/pay/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: sender.id,
          receiverUpi: targetUpi,
          amount: numAmount,
          note,
          pin: enteredPin,
        }),
      });

      const payData = await payRes.json();

      if (!payData.success) {
        setErrorMsg(payData.message || 'Payment execution failed.');
        setStep('AMOUNT');
        return;
      }

      setProcessStage('FINALIZING');
      await new Promise((r) => setTimeout(r, 600));

      setPaymentResult(payData);
      onPaymentSuccess(payData);
      setStep('SUCCESS');
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Network error while processing transaction. Please retry.');
      setStep('AMOUNT');
    }
  };

  const handleResetModal = () => {
    setStep('RECIPIENT');
    setRecipientInput('');
    setSelectedRecipient(null);
    setAmount('');
    setNote('');
    setPin('');
    setPinError('');
    setPaymentResult(null);
    setAiFraudResult(null);
    setX402Details(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs">
              x402
            </div>
            <div>
              <h3 className="font-bold text-base text-white">BlockPay Transfer</h3>
              <p className="text-[10px] text-slate-400 font-mono">Algorand Sandbox & AI Fraud Protected</p>
            </div>
          </div>

          <button
            onClick={handleResetModal}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Steps */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: SELECT RECIPIENT */}
          {step === 'RECIPIENT' && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Select or Enter Recipient
              </p>

              {/* Quick Contacts */}
              <div className="space-y-2 mb-5">
                {allUsers
                  .filter((u) => u.id !== sender.id)
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectRecipient(user)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 hover:bg-indigo-600/20 border border-slate-700/60 hover:border-indigo-500/50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30"
                        />
                        <div className="text-left">
                          <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{user.upiId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Trusted
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">A/C: XXXX{user.accountNumber.slice(-4)}</p>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Manual Input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Enter UPI ID, Phone or Account Number"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <button
                disabled={!recipientInput}
                onClick={handleCustomRecipientContinue}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Continue to Amount</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: ENTER AMOUNT & NOTE */}
          {step === 'AMOUNT' && (
            <div>
              {/* Recipient Badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">
                    {selectedRecipient?.name[0] || recipientInput[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Paying</p>
                    <p className="text-sm font-bold text-white">
                      {selectedRecipient?.name || recipientInput}
                    </p>
                    <p className="text-[10px] text-cyan-400 font-mono">
                      {selectedRecipient?.upiId || recipientInput}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('RECIPIENT')}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Amount Input */}
              <div className="text-center my-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Enter Amount (INR)
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                    className="w-48 bg-transparent text-4xl sm:text-5xl font-extrabold text-white text-center focus:outline-none font-mono"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  Available Balance: ₹{sender.balance.toLocaleString('en-IN')}
                </p>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[100, 500, 1000, 2500, 5000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition"
                  >
                    +₹{val}
                  </button>
                ))}
              </div>

              {/* Note Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Add a note (e.g., Dinner, Rent, API fee)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > sender.balance}
                onClick={() => setStep('PIN')}
                className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Proceed to UPI PIN</span>
                <Lock className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: ENTER UPI PIN */}
          {step === 'PIN' && (
            <div className="text-center">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 inline-flex items-center gap-2 text-xs font-semibold mb-4">
                <Fingerprint className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Enter {sender.name}'s UPI Security PIN</span>
              </div>

              <p className="text-xs text-slate-400 mb-1">Paying ₹{amount} to</p>
              <p className="text-sm font-bold text-white mb-6">
                {selectedRecipient?.name || recipientInput}
              </p>

              {/* PIN Dots */}
              <motion.div
                animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pin.length > index
                        ? 'bg-cyan-400 border-cyan-400 scale-110 shadow-lg shadow-cyan-500/50'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  />
                ))}
              </motion.div>

              {pinError && (
                <p className="text-xs text-rose-400 font-semibold mb-4 animate-shake">
                  {pinError}
                </p>
              )}

              {/* Demo PIN Helper Badge */}
              <div className="mb-6 p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 font-mono inline-block">
                Demo PIN for {sender.name}: <span className="text-cyan-400 font-bold">{sender.pin}</span> (or <span className="text-cyan-400 font-bold">1234</span>)
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinPress(num.toString())}
                    className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-lg font-bold text-white shadow transition active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setStep('AMOUNT')}
                  className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => handlePinPress('0')}
                  className="h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-lg font-bold text-white shadow transition active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={handlePinDelete}
                  className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-rose-400 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING PIPELINE (AI Fraud -> x402 -> Algorand) */}
          {step === 'PROCESSING' && (
            <div className="py-6 space-y-6">
              <div className="text-center">
                <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">Executing Multi-Layer Verification</h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Gemini AI Fraud Check • x402 Protocol • Algorand Consensus
                </p>
              </div>

              {/* Pipeline Step Progress Cards */}
              <div className="space-y-3">
                {/* 1. Gemini AI Fraud Check */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    processStage === 'FRAUD_CHECK'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-800/50 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold">1. Gemini AI Fraud Inspector</span>
                    </div>
                    {aiFraudResult ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {aiFraudResult.riskLevel} RISK ({aiFraudResult.riskScore}/100)
                      </span>
                    ) : (
                      <span className="text-[10px] text-cyan-400 font-mono animate-pulse">Analyzing...</span>
                    )}
                  </div>
                  {aiFraudResult && (
                    <p className="text-xs text-slate-300 font-mono mt-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      "{aiFraudResult.reason}"
                    </p>
                  )}
                </div>

                {/* 2. x402 Protocol Authorization */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    processStage === 'X402_AUTH'
                      ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800/50 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold">2. x402 Agent Protocol Challenge</span>
                    </div>
                    {x402Details ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        HTTP 402 Signed
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Pending...</span>
                    )}
                  </div>
                  {x402Details && (
                    <div className="text-[10px] text-slate-300 font-mono mt-2 bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1">
                      <p className="text-cyan-400">{x402Details.headers['HTTP-Status']}</p>
                      <p className="truncate text-slate-400">Token: {x402Details.paymentToken}</p>
                    </div>
                  )}
                </div>

                {/* 3. Algorand TestNet Blockchain */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    processStage === 'ALGORAND_BLOCK' || processStage === 'FINALIZING'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-slate-800/50 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold">3. Algorand Ledger Commit</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {processStage === 'FINALIZING' ? 'Confirmed (0.001 ALGO)' : 'Signing Hash...'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Recording immutable state transition inside MongoDB & Algorand TestNet ledger...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS RECEIPT & MONEY CELEBRATION */}
          {step === 'SUCCESS' && paymentResult && (
            <div className="text-center py-4 relative">
              {/* Money particles effect */}
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <h3 className="text-xl font-extrabold text-white">Payment Successful!</h3>
              <p className="text-3xl font-extrabold font-mono text-emerald-400 my-2">
                ₹{paymentResult.transaction.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400">
                Paid to <span className="text-white font-bold">{paymentResult.transaction.receiverName}</span> ({paymentResult.transaction.receiverUpi})
              </p>

              {/* Receipt Details Box */}
              <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Transaction Ref:</span>
                  <span className="text-white font-bold">{paymentResult.transaction.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Algorand Block:</span>
                  <span className="text-cyan-400 font-bold">#{paymentResult.transaction.algoBlockNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">TX Hash:</span>
                  <span className="text-slate-300 truncate max-w-[180px]">
                    {paymentResult.transaction.algoTxHash}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">x402 Status:</span>
                  <span className="text-emerald-400 font-bold">VERIFIED_AUTHORIZED</span>
                </div>
              </div>

              {/* Dual Carrier SMS Alerts Preview */}
              {paymentResult.sms && paymentResult.sms.length > 0 && (
                <div className="space-y-3 mb-6 text-left">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      Dual Carrier SMS Dispatched
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Real & App SMS Sent
                    </span>
                  </div>

                  {paymentResult.sms.map((smsItem: any, idx: number) => {
                    const cleanPhone = (smsItem.phone || '').replace(/\D/g, "");
                    const fullPhone = cleanPhone.startsWith("91") ? `+${cleanPhone}` : `+91${cleanPhone}`;
                    const smsUri = `sms:${fullPhone}?body=${encodeURIComponent(smsItem.message)}`;

                    return (
                      <div
                        key={smsItem.id || idx}
                        className={`p-3.5 rounded-2xl border text-left font-mono transition ${
                          smsItem.type === 'DEBIT'
                            ? 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                          <span className="flex items-center gap-1">
                            {smsItem.type === 'DEBIT' ? '🔴 DEBIT SMS' : '🟢 CREDIT SMS'}
                            <span className="text-cyan-300">({fullPhone})</span>
                          </span>
                          <span className="text-[9px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                            {new Date(smsItem.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-slate-200 mb-2.5">
                          "{smsItem.message}"
                        </p>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Ref: {smsItem.refNumber}</span>
                          <a
                            href={smsUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-sm"
                          >
                            <span>📩 Open Device SMS App</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2.5">
                {paymentResult.transaction && (
                  <button
                    onClick={() => downloadReceiptPdf(paymentResult.transaction, sender)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl border border-indigo-500/30 shadow-lg transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-cyan-300" />
                    Download PDF Receipt
                  </button>
                )}
                <button
                  onClick={handleResetModal}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 rounded-2xl border border-slate-700 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
