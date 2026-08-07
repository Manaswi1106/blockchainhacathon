import React from 'react';
import { SMSNotification, UserAccount } from '../types';
import { Smartphone, Bell, X, Check, ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SMSDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  smsList: SMSNotification[];
  activeUser: UserAccount;
}

export const SMSDrawer: React.FC<SMSDrawerProps> = ({
  isOpen,
  onClose,
  smsList,
  activeUser,
}) => {
  if (!isOpen) return null;

  const userSMS = smsList.filter((s) => s.userId === activeUser.id || s.phone === activeUser.phone);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 text-white shadow-2xl flex flex-col justify-between overflow-y-auto"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-bold text-base">SMS Notification History</h3>
                <p className="text-[10px] text-slate-400 font-mono">Carrier Simulation for +91 {activeUser.phone}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SMS Messages List */}
          <div className="space-y-3">
            {userSMS.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No SMS alerts in carrier inbox yet.
              </div>
            ) : (
              userSMS.map((sms) => (
                <div
                  key={sms.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 relative"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 font-bold text-cyan-400">
                      {sms.type === 'DEBIT' && <ArrowUpRight className="w-3 h-3 text-rose-400" />}
                      {sms.type === 'CREDIT' && <ArrowDownLeft className="w-3 h-3 text-emerald-400" />}
                      {sms.type === 'OTP' && <Lock className="w-3 h-3 text-amber-400" />}
                      {sms.type} ALERT
                    </span>
                    <span>{new Date(sms.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <p className="text-xs font-mono text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    {sms.message}
                  </p>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1">
                    <span>Ref: {sms.refNumber}</span>
                    <a
                      href={`sms:+91${sms.phone.replace(/\D/g, "")}?body=${encodeURIComponent(sms.message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-[9px] flex items-center gap-1"
                    >
                      📩 Open SMS App
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-2xl border border-slate-700 text-xs"
        >
          Close SMS Inbox
        </button>
      </motion.div>
    </div>
  );
};
