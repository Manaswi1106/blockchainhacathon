import React, { useState } from 'react';
import { UserAccount, ActiveTab, SMSNotification } from '../types';
import {
  Wallet,
  History,
  Boxes,
  Bot,
  User,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Info,
  LogOut,
  Smartphone
} from 'lucide-react';

interface NavbarProps {
  activeUser: UserAccount;
  allUsers: UserAccount[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onSwitchUser: (user: UserAccount) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  smsList: SMSNotification[];
  onOpenSMSDrawer: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeUser,
  allUsers,
  activeTab,
  setActiveTab,
  onSwitchUser,
  darkMode,
  setDarkMode,
  smsList,
  onOpenSMSDrawer,
  onOpenLoginModal,
}) => {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const unreadCount = smsList.filter((s) => s.userId === activeUser.id && !s.isRead).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Wallet className="w-4 h-4" /> },
    { id: 'history', label: 'Transactions', icon: <History className="w-4 h-4" /> },
    { id: 'blockchain', label: 'Algorand Explorer', icon: <Boxes className="w-4 h-4" /> },
    { id: 'agent', label: 'Agent Commerce AI', icon: <Bot className="w-4 h-4" /> },
    { id: 'policy', label: 'Policy Engine', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 dark:bg-slate-950/80 border-b border-slate-800/80 text-white transition-colors">
      {/* Top Banner: Simulation Mode Info */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-4 py-1 text-xs text-white font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold tracking-wide uppercase text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white">
              Simulation Mode
            </span>
            <span className="hidden sm:inline opacity-90">
              UPI, x402 Protocol & Algorand TestNet Sandbox (No real funds transferred)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLoginModal}
              className="hover:underline flex items-center gap-1 opacity-90 text-[11px]"
            >
              <Smartphone className="w-3 h-3" /> OTP Login
            </button>
            <div className="h-3 w-px bg-white/30" />
            <span className="text-[11px] opacity-80 hidden md:inline">Hackathon Demo v2.5</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  BlockPay
                </span>
                <span className="text-xs px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider">Agent Payment & Algorand</p>
            </div>
          </div>

          {/* Nav Navigation Tabs for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/50">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right User & Utility Controls */}
          <div className="flex items-center gap-3">
            {/* Account Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl px-2.5 py-1.5 transition text-left"
              >
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/50"
                />
                <div className="hidden sm:block text-xs">
                  <p className="font-semibold text-white leading-tight flex items-center gap-1">
                    {activeUser.name}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono font-medium">
                    ₹{activeUser.balance.toLocaleString('en-IN')}
                  </p>
                </div>
              </button>

              {showAccountDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                  <p className="text-[10px] font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                    Switch Demo User Account
                  </p>

                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSwitchUser(user);
                        setShowAccountDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition ${
                        user.id === activeUser.id
                          ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="text-left">
                          <p className="text-xs font-semibold">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{user.upiId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-emerald-400">
                          ₹{user.balance.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">PIN: {user.pin}</p>
                      </div>
                    </button>
                  ))}

                  <div className="border-t border-slate-800 mt-2 pt-2 flex items-center justify-between px-2 text-xs">
                    <button
                      onClick={() => {
                        onOpenLoginModal();
                        setShowAccountDropdown(false);
                      }}
                      className="text-cyan-400 hover:underline flex items-center gap-1 py-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Login with OTP
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">Dual-User Sandbox</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenSMSDrawer}
              className="relative p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition"
              title="SMS Alerts & Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex lg:hidden overflow-x-auto gap-2 py-2 no-scrollbar border-t border-slate-800/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-300'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
