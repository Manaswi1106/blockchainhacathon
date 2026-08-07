import React from 'react';
import { PaymentTransaction, UserAccount } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, ShieldCheck } from 'lucide-react';

interface SpendingAnalyticsProps {
  transactions: PaymentTransaction[];
  activeUser: UserAccount;
}

export const SpendingAnalytics: React.FC<SpendingAnalyticsProps> = ({
  transactions,
  activeUser,
}) => {
  const userTx = transactions.filter(
    (t) => t.senderId === activeUser.id || t.senderUpi === activeUser.upiId
  );

  // Category breakdown
  const categoriesMap: Record<string, number> = {};
  userTx.forEach((t) => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
  });

  const pieData = Object.keys(categoriesMap).map((cat) => ({
    name: cat,
    value: categoriesMap[cat],
  }));

  const COLORS = ['#06b6d4', '#6366f1', '#a855f7', '#10b981', '#f59e0b'];

  // Daily spending vs limit bar data
  const barData = [
    { day: 'Mon', spent: 1200, limit: activeUser.policy.dailyLimit },
    { day: 'Tue', spent: 4500, limit: activeUser.policy.dailyLimit },
    { day: 'Wed', spent: 850, limit: activeUser.policy.dailyLimit },
    { day: 'Thu', spent: 3200, limit: activeUser.policy.dailyLimit },
    { day: 'Fri', spent: 5000, limit: activeUser.policy.dailyLimit },
    { day: 'Sat', spent: 650, limit: activeUser.policy.dailyLimit },
    { day: 'Sun', spent: 2100, limit: activeUser.policy.dailyLimit },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* Category Breakdown Chart */}
      <div className="bg-[#0F1117] border border-white/10 rounded-[2rem] p-6 shadow-2xl text-white backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" /> Category Breakdown
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Monthly Total</span>
        </div>

        {pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">
            No outgoing expense transactions recorded.
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Daily Spending vs Policy Limit */}
      <div className="bg-[#0F1117] border border-white/10 rounded-[2rem] p-6 shadow-2xl text-white backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Daily Spending vs Limit
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">
            Limit: ₹{activeUser.policy.dailyLimit.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
              />
              <Bar dataKey="spent" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
