import React, { useState } from 'react';
import { UserAccount } from '../types';
import { QRCodeGenerator } from './QRCodeGenerator';
import { X, Copy, Check, Download, Share2, Layers, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface MyQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
}

export const MyQRModal: React.FC<MyQRModalProps> = ({ isOpen, onClose, user }) => {
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  const upiString = `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.name)}&mc=0000&tid=${Date.now()}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(user.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('#my-qr-code-canvas canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `BlockPay_QR_${user.upiId.replace('@', '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      alert('QR canvas not ready');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white relative text-center"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">My Payment QR</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display Area */}
        <div className="p-6 flex flex-col items-center">
          <div className="mb-4">
            <span className={`inline-block text-[11px] font-mono font-bold px-3 py-0.5 rounded-full mb-2 border ${
              user.upiId.includes('manu')
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
            }`}>
              {user.upiId.includes('manu') ? 'QR-1 SIMULATION (manu@ibl)' : 'QR-2 SIMULATION (saha@ibl)'}
            </span>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-cyan-500/30 mx-auto shadow-xl"
            />
            <h4 className="font-extrabold text-lg text-white mt-2">{user.name}</h4>
            <p className="text-xs text-slate-400 font-mono">{user.upiId}</p>
          </div>

          {/* QR Code SVG */}
          <div className="p-3 bg-white/5 rounded-3xl border border-slate-800 shadow-2xl mb-5">
            <QRCodeGenerator id="my-qr-code-canvas" value={upiString} size={180} />
          </div>

          {/* Wallet Info Badge */}
          <div className="w-full bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-5 text-left text-xs font-mono">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">Algorand Receive Address</span>
            </div>
            <p className="text-slate-300 truncate text-[11px]">{user.walletAddress}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={handleCopyUPI}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-3 rounded-2xl border border-slate-700 transition"
            >
              {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
            </button>

            <button
              onClick={handleDownloadQR}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition shadow-lg shadow-indigo-500/25 cursor-pointer"
              title="Download QR"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
