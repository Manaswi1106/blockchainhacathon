import React, { useState } from 'react';
import { UserAccount } from '../types';
import { QRCodeGenerator } from './QRCodeGenerator';
import { API } from "../utils/api";
import {
  User,
  ShieldCheck,
  Smartphone,
  CreditCard,
  Lock,
  Layers,
  Key,
  Check,
  AlertCircle
} from 'lucide-react';

interface ProfileViewProps {
  user: UserAccount;
  onOpenPolicyModal: () => void;
  onUpdateUserPin: (newPin: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenPolicyModal,
  onUpdateUserPin,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  const handleChangePin = async () => {
    if (currentPin !== user.pin) {
      setPinError('Incorrect current UPI PIN.');
      return;
    }
    if (newPin.length !== 4) {
      setPinError('New PIN must be exactly 4 digits.');
      return;
    }

    try {
      const res = await fetch(`${API}/api/users/update-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPin, newPin }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdateUserPin(newPin);
        setPinSuccess('UPI PIN updated successfully!');
        setPinError('');
        setTimeout(() => {
          setShowPinModal(false);
          setPinSuccess('');
          setCurrentPin('');
          setNewPin('');
        }, 1200);
      } else {
        setPinError(data.error || 'Failed to update PIN');
      }
    } catch (err) {
      console.error(err);
      setPinError('Server error updating PIN');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-[#0F1117] border border-white/10 rounded-[2rem] p-6 shadow-2xl text-white backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-cyan-500/40 shadow-xl"
          />

          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-extrabold flex items-center justify-center md:justify-start gap-2">
              {user.name}
              <span className="text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
              </span>
            </h2>
            <p className="text-sm font-mono text-cyan-400 mt-1">{user.upiId}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> +91 {user.phone}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> A/C: {user.accountNumber}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowPinModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs transition shadow-lg shadow-indigo-500/25"
          >
            <Key className="w-4 h-4" /> Change UPI PIN
          </button>
        </div>
      </div>

      {/* Account Details & Blockchain QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security & Spending Policy Card */}
        <div className="bg-[#0F1117] border border-white/10 rounded-[2rem] p-6 shadow-xl text-white space-y-4 backdrop-blur-md">
          <h3 className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> Security & Policy Configuration
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-3 bg-black/40 rounded-2xl border border-white/5">
              <span className="text-slate-400">Daily Spending Limit:</span>
              <span className="text-white font-bold">₹{user.policy.dailyLimit.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-3 bg-black/40 rounded-2xl border border-white/5">
              <span className="text-slate-400">Single Transaction Limit:</span>
              <span className="text-white font-bold">₹{user.policy.transactionLimit.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-3 bg-black/40 rounded-2xl border border-white/5">
              <span className="text-slate-400">Trusted Contacts:</span>
              <span className="text-emerald-400 font-bold">{user.policy.trustedAccounts.length} Verified</span>
            </div>
            <div className="flex justify-between p-3 bg-black/40 rounded-2xl border border-white/5">
              <span className="text-slate-400">Current Security PIN:</span>
              <span className="text-cyan-400 font-bold">**** (Set)</span>
            </div>
          </div>

          <button
            onClick={onOpenPolicyModal}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-2xl border border-slate-700 text-xs transition"
          >
            Configure Policy Rules
          </button>
        </div>

        {/* Algorand Wallet Badge */}
        <div className="bg-[#0F1117] border border-white/10 rounded-[2rem] p-6 shadow-xl text-white space-y-4 backdrop-blur-md">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" /> Algorand TestNet Wallet
          </h3>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <p className="text-slate-400 uppercase text-[10px]">Public Address</p>
            <p className="text-slate-200 break-all">{user.walletAddress}</p>
          </div>

          <div className="flex justify-center pt-2">
            <QRCodeGenerator value={user.walletAddress} size={140} />
          </div>
        </div>
      </div>

      {/* Change PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-base">Change UPI PIN</h3>
              <button onClick={() => setShowPinModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800">
                ✕
              </button>
            </div>

            {pinError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {pinError}
              </div>
            )}

            {pinSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" /> {pinSuccess}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Current UPI PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center text-xl font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  New 4-Digit UPI PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center text-xl font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleChangePin}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-2xl transition"
            >
              Update Security PIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
