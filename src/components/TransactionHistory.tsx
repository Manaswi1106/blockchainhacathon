import React, { useState } from 'react';
import { PaymentTransaction, UserAccount } from '../types';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
  Download,
  FileText
} from 'lucide-react';
import { downloadPassbookPdf, downloadReceiptPdf } from '../utils/pdfGenerator';

interface TransactionHistoryProps {
  transactions: PaymentTransaction[];
  activeUser: UserAccount;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  activeUser,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'CREDIT' | 'DEBIT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);

  const filtered = transactions.filter((t) => {
    const isDebit = t.senderId === activeUser.id || t.senderUpi === activeUser.upiId;
    const isCredit = t.receiverId === activeUser.id || t.receiverUpi === activeUser.upiId;

    if (!isDebit && !isCredit) return false;

    // Filter by type
    if (filterType === 'CREDIT' && !isCredit) return false;
    if (filterType === 'DEBIT' && !isDebit) return false;

    const txDate = new Date(t.timestamp);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);

    if (filterType === 'TODAY' && txDate.toDateString() !== today.toDateString()) return false;
    if (filterType === 'YESTERDAY' && txDate.toDateString() !== yesterday.toDateString()) return false;
    if (filterType === 'THIS_WEEK' && Date.now() - txDate.getTime() > 86400000 * 7) return false;

    // Search query
    const matchSearch =
      t.receiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSearch;
  });

  return (
    <div className="bg-[#0F1117] border border-white/10 rounded-[2rem] p-6 shadow-2xl text-white space-y-6 backdrop-blur-md">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" /> Transaction Ledger
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {filtered.length} Recorded transactions verified on Algorand TestNet
          </p>
        </div>

        <button
          onClick={() => downloadPassbookPdf(filtered, activeUser, filterType)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-cyan-300" /> Export PDF Statement
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'ALL', label: 'All History' },
          { id: 'TODAY', label: 'Today' },
          { id: 'YESTERDAY', label: 'Yesterday' },
          { id: 'THIS_WEEK', label: 'This Week' },
          { id: 'CREDIT', label: 'Money In (Credit)' },
          { id: 'DEBIT', label: 'Money Out (Debit)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by name, UPI ID, note, or TX ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            No transactions found matching criteria.
          </div>
        ) : (
          filtered.map((tx) => {
            const isDebit = tx.senderId === activeUser.id || tx.senderUpi === activeUser.upiId;
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isDebit
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {isDebit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                      {isDebit ? tx.receiverName : tx.senderName}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {isDebit ? tx.receiverUpi : tx.senderUpi} • "{tx.note}"
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">
                        Block #{tx.algoBlockNumber}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-base font-mono font-extrabold ${
                      isDebit ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isDebit ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Transaction Receipt Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-base">Payment Receipt Details</h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="text-center my-4">
              <p className="text-2xl font-mono font-extrabold text-white">
                ₹{selectedTx.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedTx.senderName} ➔ {selectedTx.receiverName}
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-white font-bold">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-slate-300">{new Date(selectedTx.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Algorand Block:</span>
                <span className="text-cyan-400">#{selectedTx.algoBlockNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="text-slate-300">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Risk Rating:</span>
                <span className="text-emerald-400">{selectedTx.aiRiskLevel} RISK ({selectedTx.aiRiskScore}/100)</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => downloadReceiptPdf(selectedTx, activeUser)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl border border-indigo-500/30 transition shadow-md"
              >
                <Download className="w-4 h-4 text-cyan-300" /> Download PDF Receipt
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-2xl border border-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
