import React, { useState, useEffect } from 'react';
import { AlgorandBlock, PaymentTransaction } from '../types';
import {
  Boxes,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Cpu,
  Clock,
  Copy,
  Check,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { downloadBlockchainAuditPdf } from '../utils/pdfGenerator';

interface BlockchainExplorerProps {
  transactions: PaymentTransaction[];
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ transactions }) => {
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<AlgorandBlock | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/blockchain/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const filteredTx = transactions.filter(
    (t) =>
      t.algoTxHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.senderUpi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiverUpi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.algoBlockNumber.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Network Header Banner */}
      <div className="p-6 rounded-[2rem] bg-[#0F1117] border border-white/10 shadow-2xl text-white relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Boxes className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-extrabold tracking-tight">Algorand TestNet Ledger</h2>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Node
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Immutable ledger synchronization & x402 payment proof records
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-mono transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Refresh Ledger State
          </button>
        </div>

        {/* Network Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 relative z-10">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] uppercase font-mono text-slate-400">Block Height</p>
            <p className="text-lg font-bold font-mono text-cyan-300">
              #{stats?.latestBlock || 38491204}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] uppercase font-mono text-slate-400">Throughput</p>
            <p className="text-lg font-bold font-mono text-emerald-400">
              {stats?.tps || 1240} TPS
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] uppercase font-mono text-slate-400">Block Finality</p>
            <p className="text-lg font-bold font-mono text-purple-300">
              {stats?.avgBlockTime || '3.3s'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <p className="text-[10px] uppercase font-mono text-slate-400">Standard Gas Fee</p>
            <p className="text-lg font-bold font-mono text-amber-300">
              {stats?.gasFee || '0.001 ALGO'}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by Algorand TX Hash, Block Number, or UPI Address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Blocks Feed */}
        <div className="lg:col-span-1 bg-[#0F1117] border border-white/10 rounded-[2rem] p-5 shadow-xl text-white backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" /> Latest Blocks
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Pure PoS Consensus</span>
          </div>

          <div className="space-y-3">
            {(stats?.blocks || []).map((blk: AlgorandBlock) => (
              <div
                key={blk.blockNumber}
                onClick={() => setSelectedBlock(blk)}
                className="p-3 rounded-2xl bg-black/40 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/40 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-mono text-cyan-300">
                    Block #{blk.blockNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(blk.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 truncate mb-1">
                  Hash: {blk.hash}
                </p>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Proposer: {blk.proposer}</span>
                  <span className="text-emerald-400 font-semibold">{blk.txCount} TXs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Algorand Verified Transactions Table */}
        <div className="lg:col-span-2 bg-[#0F1117] border border-white/10 rounded-[2rem] p-5 shadow-xl text-white backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Verified On-Chain Transactions
            </h3>
            <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              x402 Protocol Certified
            </span>
          </div>

          <div className="space-y-3">
            {filteredTx.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No matching transactions found.
              </div>
            ) : (
              filteredTx.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{tx.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Block #{tx.algoBlockNumber}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-cyan-400 truncate mb-2">
                    Hash: {tx.algoTxHash}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                    <span>
                      {tx.senderName} ({tx.senderUpi}) ➔ {tx.receiverName} ({tx.receiverUpi})
                    </span>
                    <span className="text-slate-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transaction Detail Inspector Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Algorand Block Audit Log</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase">Transaction Hash</p>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-cyan-300 font-bold truncate">{selectedTx.algoTxHash}</p>
                  <button onClick={() => handleCopy(selectedTx.algoTxHash)} className="p-1 text-slate-400">
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase">Block Height</p>
                  <p className="text-white font-bold mt-1">#{selectedTx.algoBlockNumber}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-[10px] uppercase">Status</p>
                  <p className="text-emerald-400 font-bold mt-1">FINALIZED (100% Confirmed)</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-slate-400 text-[10px] uppercase">x402 Agent Commerce Token</p>
                <p className="text-purple-300 truncate">{selectedTx.x402Token}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-slate-400 text-[10px] uppercase">Gemini AI Risk Assessment</p>
                <p className="text-emerald-400 font-bold">
                  {selectedTx.aiRiskLevel} RISK (Score: {selectedTx.aiRiskScore}/100)
                </p>
                <p className="text-slate-300 text-[11px]">{selectedTx.aiReason}</p>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => downloadBlockchainAuditPdf(selectedTx)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-2xl border border-indigo-500/30 transition shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-300" /> Download PDF Audit Proof
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
