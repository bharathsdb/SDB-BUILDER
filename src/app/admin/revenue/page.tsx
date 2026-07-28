"use client";

import * as React from "react";
import { IndianRupee, TrendingUp, TrendingDown, Download, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge } from "@/components/ui";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const revenueByMonth = [28500, 32200, 30100, 35800, 41200, 43800, 41800, 45200, 48800, 51200, 53800, 56450];
const maxRev = Math.max(...revenueByMonth);

const planRevenue = [
  { plan: "Free", count: 2749, percent: 60, color: "bg-zinc-600" },
  { plan: "Pro", count: 1375, percent: 30, color: "bg-primary" },
  { plan: "Enterprise", count: 458, percent: 10, color: "bg-purple-500" },
];

const transactions = [
  { id: "tx-001", user: "John Doe", plan: "Pro", amount: "$29.00", date: "Jun 1, 2025", status: "Completed" },
  { id: "tx-002", user: "Sarah Chen", plan: "Enterprise", amount: "$99.00", date: "Jun 1, 2025", status: "Completed" },
  { id: "tx-003", user: "Mike Builder", plan: "Pro", amount: "$29.00", date: "May 31, 2025", status: "Completed" },
  { id: "tx-004", user: "Emily Davis", plan: "Free", amount: "$0.00", date: "May 30, 2025", status: "N/A" },
  { id: "tx-005", user: "Alex Kumar", plan: "Pro", amount: "$29.00", date: "May 29, 2025", status: "Completed" },
  { id: "tx-006", user: "Ar. Priya Sharma", plan: "Enterprise", amount: "$99.00", date: "May 28, 2025", status: "Pending" },
  { id: "tx-007", user: "David Chen", plan: "Pro", amount: "$29.00", date: "May 27, 2025", status: "Completed" },
];

export default function AdminRevenuePage() {
  const [dateRange, setDateRange] = React.useState("2025");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Revenue Analytics</h1>
          <p className="text-zinc-400">Financial metrics and revenue breakdown.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <Button variant="secondary" onClick={() => {}}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <p className="text-sm text-zinc-400 mb-1">Total Revenue</p>
          <h2 className="text-4xl font-bold text-white">$128,450</h2>
          <p className="text-xs text-green-400 flex items-center gap-1 mt-2"><TrendingUp className="w-3 h-3" /> +12.3% vs last year</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <p className="text-sm text-zinc-400 mb-1">Monthly Recurring Revenue (MRR)</p>
          <h2 className="text-4xl font-bold text-white">$56,450</h2>
          <p className="text-xs text-green-400 flex items-center gap-1 mt-2"><TrendingUp className="w-3 h-3" /> +4.7% this month</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <p className="text-sm text-zinc-400 mb-1">Annual Run Rate (ARR)</p>
          <h2 className="text-4xl font-bold text-white">$677,400</h2>
          <p className="text-xs text-green-400 flex items-center gap-1 mt-2"><TrendingUp className="w-3 h-3" /> Projected annual</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h3 className="font-bold text-white mb-1">Monthly Revenue</h3>
          <p className="text-sm text-zinc-400 mb-6">{dateRange} revenue breakdown by month</p>
          <div className="flex items-end gap-2 h-48">
            {months.map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-zinc-800 rounded-t-lg relative" style={{ height: "100%" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(revenueByMonth[i] / maxRev) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.03 }}
                    className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg"
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h3 className="font-bold text-white mb-1">Revenue by Plan</h3>
          <p className="text-sm text-zinc-400 mb-6">User distribution</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden" style={{
                background: `conic-gradient(var(--color-primary) 0% 30%, #a855f7 30% 40%, #52525b 40% 100%)`
              }}>
                <div className="absolute inset-3 bg-zinc-900 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">4,582</p>
                    <p className="text-xs text-zinc-400">Users</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {planRevenue.map((p) => (
                  <div key={p.plan} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${p.color.replace("bg-", "bg-")}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{p.plan}</p>
                      <p className="text-xs text-zinc-400">{p.count} users ({p.percent}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>
        <Card className="overflow-hidden !bg-zinc-900 !border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 font-semibold text-zinc-400">Transaction ID</th>
                  <th className="text-left p-4 font-semibold text-zinc-400">User</th>
                  <th className="text-left p-4 font-semibold text-zinc-400">Plan</th>
                  <th className="text-left p-4 font-semibold text-zinc-400">Amount</th>
                  <th className="text-left p-4 font-semibold text-zinc-400">Date</th>
                  <th className="text-left p-4 font-semibold text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-zinc-300">{tx.id}</td>
                    <td className="p-4 font-medium text-white">{tx.user}</td>
                    <td className="p-4">
                      <Badge variant={tx.plan === "Enterprise" ? "success" : tx.plan === "Pro" ? "info" : "default"}>{tx.plan}</Badge>
                    </td>
                    <td className="p-4 font-medium text-white">{tx.amount}</td>
                    <td className="p-4 text-zinc-400">{tx.date}</td>
                    <td className="p-4">
                      <Badge variant={tx.status === "Completed" ? "success" : tx.status === "Pending" ? "warning" : "default"}>{tx.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
