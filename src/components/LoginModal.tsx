import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Smartphone, Lock, X, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { API } from "../utils/api";
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('9347868283');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [smsPreview, setSmsPreview] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    try {
      const res = await fetch(`${API}/api/auth/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedOtp(data.otp);
        setSmsPreview(data.sms.message);
        setOtp(data.otp); // Pre-fill for hackathon demo speed
        setStep('OTP');
        setError('');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
        setStep('PHONE');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      setError('OTP verification failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base">OTP Authentication</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {step === 'PHONE' ? (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Enter Mobile Number
            </label>
            <div className="flex gap-2 mb-4">
              <span className="bg-slate-950 border border-slate-800 px-3 py-3.5 rounded-2xl text-xs font-mono text-slate-400 flex items-center">
                +91
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Quick Demo Presets */}
            <p className="text-[10px] text-slate-400 font-mono mb-2 uppercase">Quick Demo Phone Login:</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setPhone(u.phone)}
                  className={`p-2 rounded-xl text-xs font-mono text-left border transition ${
                    phone === u.phone ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <p className="font-bold">{u.name}</p>
                  <p className="text-[10px]">{u.phone}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleSendOtp}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Get Verification OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            {/* SMS Notification Banner Animation */}
            {smsPreview && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 mb-6 text-left shadow-xl font-mono">
                <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" /> SMS Dispatched (+91 {phone})
                  </span>
                  <a
                    href={`sms:+91${phone}?body=${encodeURIComponent(smsPreview)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-[9px]"
                  >
                    📩 Open SMS
                  </a>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  "{smsPreview}"
                </p>
              </div>
            )}

            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-center mb-2">
              Enter 6-Digit OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-2xl font-mono text-center tracking-widest text-cyan-400 focus:outline-none focus:border-cyan-500 mb-6"
            />

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify OTP & Login</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
