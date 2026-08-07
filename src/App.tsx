import React, { useState, useEffect } from 'react';
import { UserAccount, PaymentTransaction, ActiveTab, SMSNotification } from './types';
import { Navbar } from './components/Navbar';
import { BalanceCard } from './components/BalanceCard';
import { QuickActions } from './components/QuickActions';
import { SendMoneyModal } from './components/SendMoneyModal';
import { QRScannerModal } from './components/QRScannerModal';
import { MyQRModal } from './components/MyQRModal';
import { BlockchainExplorer } from './components/BlockchainExplorer';
import { TransactionHistory } from './components/TransactionHistory';
import { PolicyEngineModal } from './components/PolicyEngineModal';
import { AIAgentAssistantModal } from './components/AIAgentAssistantModal';
import { SMSDrawer } from './components/SMSDrawer';
import { LoginModal } from './components/LoginModal';
import { ProfileView } from './components/ProfileView';
import { SpendingAnalytics } from './components/SpendingAnalytics';
import { Smartphone, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API } from "./utils/api";
export default function App() {
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [activeUser, setActiveUser] = useState<UserAccount | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [smsList, setSmsList] = useState<SMSNotification[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [darkMode, setDarkMode] = useState(true);

  // Modals state
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [prefilledRecipient, setPrefilledRecipient] = useState('');
  const [isScanQRModalOpen, setIsScanQRModalOpen] = useState(false);
  const [isMyQRModalOpen, setIsMyQRModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [isSMSDrawerOpen, setIsSMSDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // SMS Banner Push Toast
  const [pushSms, setPushSms] = useState<SMSNotification | null>(null);

  // Initial Fetch Data from Backend Express Server
  const loadData = async () => {
    try {
      const usersRes = await fetch(`${API}/api/users`);
      const usersData = await usersRes.json();
      if (usersData.success && usersData.users.length > 0) {
        setAllUsers(usersData.users);
        if (!activeUser) {
          setActiveUser(usersData.users[0]); // Default Sahasra Kona
        } else {
          const updatedActive = usersData.users.find((u: UserAccount) => u.id === activeUser.id);
          if (updatedActive) setActiveUser(updatedActive);
        }
      }

      const txRes = await fetch(`${API}/api/transactions`);
      const txData = await txRes.json();
      if (txData.success) {
        setTransactions(txData.transactions);
      }

      const smsRes = await fetch(`${API}/api/sms`);
      const smsData = await smsRes.json();
      if (smsData.success) {
        setSmsList(smsData.smsList);
      }
    } catch (err) {
      console.error('Failed loading backend state:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitchUser = (user: UserAccount) => {
    setActiveUser(user);
  };

  const handleOpenSendModal = (recipientUpi?: string) => {
    setPrefilledRecipient(recipientUpi || '');
    setIsSendModalOpen(true);
  };

  const handlePaymentSuccess = (payData: any) => {
    // Refresh backend state
    loadData();

    // Trigger phone SMS notification push banner
    if (payData.sms && payData.sms[0]) {
      setPushSms(payData.sms[0]);
      setTimeout(() => setPushSms(null), 6000);
    }
  };

  const handleScanQRSuccess = (recipientUpi: string) => {
    handleOpenSendModal(recipientUpi);
  };

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-xs">
        Loading BlockPay AI Engine...
      </div>
    );
  }

  const demoFriend = allUsers.find((u) => u.id !== activeUser.id) || allUsers[1] || allUsers[0];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#05060B] text-slate-100' : 'bg-slate-900 text-slate-100'} transition-colors font-sans antialiased relative overflow-x-hidden flex flex-col justify-between`}>
      {/* Background Atmosphere Radial Glows */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navbar Header */}
        <Navbar
          activeUser={activeUser}
          allUsers={allUsers}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSwitchUser={handleSwitchUser}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          smsList={smsList}
          onOpenSMSDrawer={() => setIsSMSDrawerOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Floating SMS Push Banner Notification */}
        <AnimatePresence>
          {pushSms && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-[#0F1117] border border-cyan-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-white backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">BlockPay Carrier Alert</h4>
                    <p className="text-[10px] text-cyan-300 font-mono">SMS to +91 {pushSms.phone}</p>
                  </div>
                </div>
                <button onClick={() => setPushSms(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-mono text-slate-200 mt-2 bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                "{pushSms.message}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main App Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Balance Virtual Card */}
              <BalanceCard
                user={activeUser}
                onOpenSendModal={() => handleOpenSendModal()}
                onOpenScanQRModal={() => setIsScanQRModalOpen(true)}
                onOpenMyQRModal={() => setIsMyQRModalOpen(true)}
                onOpenAgentModal={() => setIsAgentModalOpen(true)}
              />

              {/* Quick Actions Grid */}
              <QuickActions
                onOpenSendModal={handleOpenSendModal}
                onOpenScanQRModal={() => setIsScanQRModalOpen(true)}
                onOpenMyQRModal={() => setIsMyQRModalOpen(true)}
                onOpenAgentModal={() => setIsAgentModalOpen(true)}
                onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
                onOpenBlockchainTab={() => setActiveTab('blockchain')}
                demoFriendUpi={demoFriend.upiId}
              />

              {/* Recharts Analytics Charts */}
              <SpendingAnalytics transactions={transactions} activeUser={activeUser} />

              {/* Recent Activity List */}
              <TransactionHistory transactions={transactions} activeUser={activeUser} />
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'history' && (
            <TransactionHistory transactions={transactions} activeUser={activeUser} />
          )}

          {/* ALGORAND BLOCKCHAIN EXPLORER TAB */}
          {activeTab === 'blockchain' && (
            <BlockchainExplorer transactions={transactions} />
          )}

          {/* AGENT COMMERCE AI TAB */}
          {activeTab === 'agent' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-8 rounded-[2rem] bg-[#0F1117] border border-white/10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300">
                  Agent Commerce AI Platform
                </h2>
                <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed">
                  Powered by Gemini 3.6 Flash & x402 Protocol for autonomous machine payments and intelligent spending checks.
                </p>
                <button
                  onClick={() => setIsAgentModalOpen(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-purple-500/25 active:scale-98"
                >
                  Launch BlockPay AI Assistant
                </button>
              </div>
              <SpendingAnalytics transactions={transactions} activeUser={activeUser} />
            </div>
          )}

          {/* POLICY ENGINE TAB */}
          {activeTab === 'policy' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-8 rounded-[2rem] bg-[#0F1117] border border-white/10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-200 to-yellow-300">
                  Spending Policy Engine
                </h2>
                <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed">
                  Configurable daily limits, transaction thresholds, blacklists, and trusted recipient whitelists enforced on every x402 payment contract.
                </p>
                <button
                  onClick={() => setIsPolicyModalOpen(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-amber-500/25 active:scale-98"
                >
                  Configure Security Limits
                </button>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <ProfileView
              user={activeUser}
              onOpenPolicyModal={() => setIsPolicyModalOpen(true)}
              onUpdateUserPin={(newPin) => {
                setActiveUser({ ...activeUser, pin: newPin });
                loadData();
              }}
            />
          )}
        </main>
      </div>

      {/* Bottom Status Ribbon */}
      <footer className="h-9 bg-black/40 border-t border-white/10 px-4 sm:px-8 flex items-center justify-between text-[10px] font-mono text-slate-400 relative z-20 backdrop-blur-md">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Express Server Online</span>
          <span className="flex items-center gap-1.5 hidden sm:inline-flex"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Algorand Testnet Active</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="hidden md:inline">X402 PROTOCOL v1.4.2</span>
          <span className="text-emerald-400 font-bold">LATENCY: 38ms</span>
        </div>
      </footer>

      {/* ALL MODALS & DRAWERS */}
      <SendMoneyModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        sender={activeUser}
        allUsers={allUsers}
        initialRecipientUpi={prefilledRecipient}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <QRScannerModal
        isOpen={isScanQRModalOpen}
        onClose={() => setIsScanQRModalOpen(false)}
        allUsers={allUsers}
        activeUser={activeUser}
        onScanSuccess={handleScanQRSuccess}
      />

      <MyQRModal
        isOpen={isMyQRModalOpen}
        onClose={() => setIsMyQRModalOpen(false)}
        user={activeUser}
      />

      <PolicyEngineModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        user={activeUser}
        onUpdatePolicy={(newPolicy) => {
          setActiveUser({ ...activeUser, policy: newPolicy });
          loadData();
        }}
      />

      <AIAgentAssistantModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        user={activeUser}
        onOpenSendModal={handleOpenSendModal}
      />

      <SMSDrawer
        isOpen={isSMSDrawerOpen}
        onClose={() => setIsSMSDrawerOpen(false)}
        smsList={smsList}
        activeUser={activeUser}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        allUsers={allUsers}
        onLoginSuccess={(u) => {
          setActiveUser(u);
          loadData();
        }}
      />
    </div>
  );
}
