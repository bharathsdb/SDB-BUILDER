"use client";

import * as React from "react";
import { Sparkles, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge, Card } from "@/components/ui";
import { mockGenerationHistory } from "@/lib/api/mock-db";

const stats = [
  { name: "Total Generations", value: "89,234", icon: Sparkles, change: "+45%", color: "text-purple-400", bg: "bg-purple-500/10" },
  { name: "Daily Average", value: "487", icon: BarChart3, change: "+12%", color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "Active Users", value: "1,234", icon: Users, change: "+8%", color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Monthly Cost", value: "$4,892", icon: DollarSign, change: "+15%", color: "text-amber-400", bg: "bg-amber-500/10" },
];

const generationTypes = [
  { type: "Floor Plan", count: 32450, percent: 36, color: "bg-primary" },
  { type: "Vastu", count: 18720, percent: 21, color: "bg-blue-500" },
  { type: "Cost Estimate", count: 14230, percent: 16, color: "bg-purple-500" },
  { type: "Interior", count: 12450, percent: 14, color: "bg-amber-500" },
  { type: "Variations", count: 11384, percent: 13, color: "bg-green-500" },
];

const dailyData = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  count: Math.floor(Math.random() * 200) + 300,
}));

const maxDaily = Math.max(...dailyData.map((d) => d.count));

const topUsers = [
  { name: "John Doe", email: "john@example.com", generations: 1245, plan: "Enterprise" },
  { name: "Sarah Chen", email: "sarah@example.com", generations: 892, plan: "Pro" },
  { name: "Ar. Priya Sharma", email: "priya@example.com", generations: 756, plan: "Enterprise" },
  { name: "Mike Builder", email: "mike@example.com", generations: 534, plan: "Pro" },
  { name: "Emily Davis", email: "emily@example.com", generations: 423, plan: "Pro" },
];

const costData = [
  { model: "GPT-4 Vision", cost: "$2,450", percent: 50, calls: 45200 },
  { model: "Stable Diffusion", cost: "$1,224", percent: 25, calls: 28450 },
  { model: "Vastu Engine", cost: "$734", percent: 15, calls: 12500 },
  { model: "Cost Estimator", cost: "$484", percent: 10, calls: 7084 },
];

export default function AdminAIUsagePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">AI Usage Analytics</h1>
        <p className="text-zinc-400">Monitor AI generation usage and costs.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800"
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-zinc-400 mb-1">{stat.name}</p>
            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            <p className="text-xs text-green-400 flex items-center gap-1 mt-2"><TrendingUp className="w-3 h-3" /> {stat.change} this month</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Usage by Type - Bar Chart */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h3 className="font-bold text-white mb-1">Usage by Generation Type</h3>
          <p className="text-sm text-zinc-400 mb-6">Total: 89,234 generations</p>
          <div className="space-y-4">
            {generationTypes.map((gen) => (
              <div key={gen.type}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-zinc-300 font-medium">{gen.type}</span>
                  <span className="text-zinc-400">{gen.count.toLocaleString()} ({gen.percent}%)</span>
                </div>
                <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${gen.percent}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${gen.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Generation Trend */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h3 className="font-bold text-white mb-1">Daily Generation Trend</h3>
          <p className="text-sm text-zinc-400 mb-6">Last 30 days</p>
          <div className="flex items-end gap-1 h-40">
            {dailyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-zinc-800 rounded-t relative" style={{ height: "100%" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / maxDaily) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.01 }}
                    className="absolute bottom-0 w-full bg-primary/60 rounded-t"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Top Users by Generations</h2>
        <Card className="overflow-hidden !bg-zinc-900 !border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 font-semibold text-zinc-400">User</th>
                  <th className="text-left p-4 font-semibold text-zinc-400">Email</th>
                  <th className="text-left p-4 font-semibold text-zinc-400">Generations</th>
                  <th className="text-left p-4 font-semibold text-zinc-400">Plan</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-medium text-white">{user.name}</td>
                    <td className="p-4 text-zinc-400">{user.email}</td>
                    <td className="p-4 font-medium text-white">{user.generations.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant={user.plan === "Enterprise" ? "success" : "info"}>{user.plan}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cost Analysis */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">AI Cost Analysis</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {costData.map((model, i) => (
            <motion.div
              key={model.model}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800"
            >
              <p className="text-sm text-zinc-400 mb-1">{model.model}</p>
              <p className="text-2xl font-bold text-white mb-2">{model.cost}</p>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full" style={{ width: `${model.percent}%` }} />
              </div>
              <p className="text-xs text-zinc-500">{model.calls.toLocaleString()} calls ({model.percent}%)</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
