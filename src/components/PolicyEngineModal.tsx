import React, { useState } from 'react';
import { UserAccount, SpendingPolicy } from '../types';
import {
  ShieldCheck,
  X,
  Plus,
  Trash2,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  UserX,
  UserCheck
} from 'lucide-react';

interface PolicyEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onUpdatePolicy: (newPolicy: SpendingPolicy) => void;
}

export const PolicyEngineModal: React.FC<PolicyEngineModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdatePolicy,
}) => {
  const [policy, setPolicy] = useState<SpendingPolicy>(user.policy);
  const [newBlocked, setNewBlocked] = useState('');
  const [newTrusted, setNewTrusted] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      const res = await fetch('/api/users/update-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, policy }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdatePolicy(policy);
        setSavedSuccess(true);
        setTimeout(() => {
          setSavedSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBlocked = () => {
    if (newBlocked && !policy.blockedAccounts.includes(newBlocked)) {
      setPolicy({
        ...policy,
        blockedAccounts: [...policy.blockedAccounts, newBlocked],
      });
      setNewBlocked('');
    }
  };

  const handleRemoveBlocked = (upi: string) => {
    setPolicy({
      ...policy,
      blockedAccounts: policy.blockedAccounts.filter((a) => a !== upi),
    });
  };

  const handleAddTrusted = () => {
    if (newTrusted && !policy.trustedAccounts.includes(newTrusted)) {
      setPolicy({
        ...policy,
        trustedAccounts: [...policy.trustedAccounts, newTrusted],
      });
      setNewTrusted('');
    }
  };

  const handleRemoveTrusted = (upi: string) => {
    setPolicy({
      ...policy,
      trustedAccounts: policy.trustedAccounts.filter((a) => a !== upi),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base">Spending Policy Engine</h3>
              <p className="text-xs text-slate-400 font-mono">
                Automated security rules enforced before x402 authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Policy rules updated successfully!
          </div>
        )}

        <div className="space-y-6">
          {/* Numeric Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Max Daily Spending Limit (₹)
              </label>
              <input
                type="number"
                value={policy.dailyLimit}
                onChange={(e) => setPolicy({ ...policy, dailyLimit: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Single Transaction Limit (₹)
              </label>
              <input
                type="number"
                value={policy.transactionLimit}
                onChange={(e) =>
                  setPolicy({ ...policy, transactionLimit: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white font-mono focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Trusted Accounts */}
          <div>
            <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-2">
              <UserCheck className="w-4 h-4" /> Trusted Recipient Whitelist
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter UPI ID (e.g., friend@blockpay)"
                value={newTrusted}
                onChange={(e) => setNewTrusted(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white font-mono"
              />
              <button
                onClick={handleAddTrusted}
                className="px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {policy.trustedAccounts.map((upi) => (
                <span
                  key={upi}
                  className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-mono flex items-center gap-2"
                >
                  {upi}
                  <button onClick={() => handleRemoveTrusted(upi)} className="hover:text-rose-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Blocked Accounts */}
          <div>
            <label className="text-xs font-semibold text-rose-400 flex items-center gap-1 mb-2">
              <UserX className="w-4 h-4" /> Blocked Accounts Blacklist
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter malicious UPI ID"
                value={newBlocked}
                onChange={(e) => setNewBlocked(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs text-white font-mono"
              />
              <button
                onClick={handleAddBlocked}
                className="px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-semibold"
              >
                Block
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {policy.blockedAccounts.map((upi) => (
                <span
                  key={upi}
                  className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-mono flex items-center gap-2"
                >
                  {upi}
                  <button onClick={() => handleRemoveBlocked(upi)} className="hover:text-white">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-2xl text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3 rounded-2xl text-xs shadow-lg shadow-cyan-500/25"
          >
            Save Security Policy
          </button>
        </div>
      </div>
    </div>
  );
};
