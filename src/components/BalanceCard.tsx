import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  Eye,
  EyeOff,
  Send,
  QrCode,
  ArrowDownLeft,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface BalanceCardProps {
  user: UserAccount;
  onOpenSendModal: () => void;
  onOpenScanQRModal: () => void;
  onOpenMyQRModal: () => void;
  onOpenAgentModal: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  user,
  onOpenSendModal,
  onOpenScanQRModal,
  onOpenMyQRModal,
  onOpenAgentModal,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copiedWallet, setCopiedWallet] = useState(false);

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(user.walletAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-[#0F1117] border border-white/10 p-6 sm:p-8 shadow-2xl text-white">
      {/* Decorative Gradient Glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Card Bar */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-cyan-500/50 shadow-lg"
          />
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              {user.name}
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> Verified
              </span>
            </h2>
            <p className="text-xs text-slate-300 font-mono">{user.upiId}</p>
          </div>
        </div>

        {/* Chip & Brand */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-6 h-6 animate-pulse" />
            <span className="font-mono font-bold tracking-widest text-xs uppercase text-slate-300">
              BlockPay x402
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            A/C: XXXX{user.accountNumber.slice(-4)}
          </span>
        </div>
      </div>

      {/* Middle Balance Section */}
      <div className="my-6 relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="uppercase tracking-wider font-semibold">Available Liquidity</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition"
          >
            {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showBalance ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
            {showBalance ? `₹${user.balance.toLocaleString('en-IN')}` : '₹ • • • • • •'}
          </span>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Ready for Transfer
          </span>
        </div>
      </div>

      {/* Algorand Wallet Address Badge */}
      <div className="relative z-10 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2 mb-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
              Algorand TestNet Wallet
            </p>
            <p className="text-xs font-mono text-slate-200 truncate">
              {user.walletAddress}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyWallet}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
          title="Copy Wallet Address"
        >
          {copiedWallet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Payment Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        <button
          onClick={onOpenSendModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg shadow-cyan-500/25 transition active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Pay / Send</span>
        </button>

        <button
          onClick={onOpenScanQRModal}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-3 px-4 rounded-2xl border border-slate-700 shadow-md transition active:scale-95"
        >
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span>Scan QR</span>
        </button>

        <button
          onClick={onOpenMyQRModal}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-3 px-4 rounded-2xl border border-slate-700 shadow-md transition active:scale-95"
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          <span>My QR</span>
        </button>

        <button
          onClick={onOpenAgentModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg shadow-purple-500/25 transition active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>Agent AI</span>
        </button>
      </div>
    </div>
  );
};
