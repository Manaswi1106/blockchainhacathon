import React from 'react';
import {
  Send,
  QrCode,
  Smartphone,
  ShieldCheck,
  Boxes,
  Bot,
  Receipt,
  UserCheck
} from 'lucide-react';

interface QuickActionsProps {
  onOpenSendModal: (recipientUpi?: string) => void;
  onOpenScanQRModal: () => void;
  onOpenMyQRModal: () => void;
  onOpenAgentModal: () => void;
  onOpenPolicyModal: () => void;
  onOpenBlockchainTab: () => void;
  demoFriendUpi: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenSendModal,
  onOpenScanQRModal,
  onOpenMyQRModal,
  onOpenAgentModal,
  onOpenPolicyModal,
  onOpenBlockchainTab,
  demoFriendUpi,
}) => {
  const actions = [
    {
      label: 'Pay Friend',
      desc: demoFriendUpi,
      icon: <UserCheck className="w-5 h-5 text-cyan-400" />,
      color: 'bg-[#0F1117] border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5',
      onClick: () => onOpenSendModal(demoFriendUpi),
    },
    {
      label: 'Scan QR Code',
      desc: 'Instant Camera Scan',
      icon: <QrCode className="w-5 h-5 text-indigo-400" />,
      color: 'bg-[#0F1117] border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5',
      onClick: onOpenScanQRModal,
    },
    {
      label: 'Receive via QR',
      desc: 'Display UPI Code',
      icon: <Receipt className="w-5 h-5 text-emerald-400" />,
      color: 'bg-[#0F1117] border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5',
      onClick: onOpenMyQRModal,
    },
    {
      label: 'Agent AI Pay',
      desc: 'x402 Commerce Bot',
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      color: 'bg-[#0F1117] border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5',
      onClick: onOpenAgentModal,
    },
    {
      label: 'Policy Engine',
      desc: 'Spending & Limits',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      color: 'bg-[#0F1117] border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5',
      onClick: onOpenPolicyModal,
    },
    {
      label: 'Algorand Ledger',
      desc: 'TestNet Explorer',
      icon: <Boxes className="w-5 h-5 text-sky-400" />,
      color: 'bg-[#0F1117] border-white/10 hover:border-sky-500/50 hover:bg-sky-500/5',
      onClick: onOpenBlockchainTab,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
      {actions.map((act, index) => (
        <button
          key={index}
          onClick={act.onClick}
          className={`flex flex-col items-start p-4 rounded-2xl border transition-all duration-300 text-left backdrop-blur-md shadow-lg ${act.color}`}
        >
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 mb-3 shadow-inner">
            {act.icon}
          </div>
          <p className="text-xs font-bold text-white mb-0.5">{act.label}</p>
          <p className="text-[10px] text-slate-400 truncate w-full font-mono">{act.desc}</p>
        </button>
      ))}
    </div>
  );
};
