"use client";

import * as React from "react";
import { Users, IndianRupee, FolderKanban, Sparkles, TrendingUp, TrendingDown, Activity, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import { mockUsers } from "@/lib/api/mock-db";

const stats = [
  { name: "Total Users", value: "4,582", icon: Users, change: "+12%", trend: "up", color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "Revenue", value: "$128,450", icon: IndianRupee, change: "+8.2%", trend: "up", color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Projects", value: "12,847", icon: FolderKanban, change: "+23%", trend: "up", color: "text-primary", bg: "bg-primary/10" },
  { name: "AI Generations", value: "89,234", icon: Sparkles, change: "+45%", trend: "up", color: "text-purple-400", bg: "bg-purple-500/10" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const revenueData = [8500, 9200, 10100, 9500, 11200, 12400, 11800, 13500, 14200, 12800, 15100, 16450];
const maxRevenue = Math.max(...revenueData);

const recentSignups = mockUsers.map((u) => ({ ...u, status: u.verified ? "Verified" as const : "Pending" as const }));

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-zinc-400">Platform overview and key metrics.</p>
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
            <p className="text-sm font-medium text-zinc-400 mb-1">{stat.name}</p>
            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            <div className="flex items-center gap-1 mt-2">
              {stat.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>{stat.change}</span>
              <span className="text-xs text-zinc-500">vs last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-white">Revenue Overview</h3>
              <p className="text-sm text-zinc-400">Monthly revenue for 2025</p>
            </div>
            <select className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm focus:outline-none">
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>
          <div className="flex items-end gap-2 h-48">
            {months.map((month, i) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-zinc-800 rounded-t-lg relative" style={{ height: "100%" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(revenueData[i] / maxRevenue) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.03 }}
                    className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Recent Signups</h3>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentSignups.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <Badge variant={user.verified ? "success" : "warning"}>{user.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">System Health</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "API Response Time", value: "124ms", status: "healthy", icon: Activity },
            { name: "Uptime", value: "99.97%", status: "healthy", icon: CheckCircle },
            { name: "Error Rate", value: "0.02%", status: "healthy", icon: AlertTriangle },
            { name: "Last Deploy", value: "2h ago", status: "info", icon: Clock },
          ].map((item) => (
            <div key={item.name} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">{item.name}</p>
                <p className="text-lg font-bold text-white">{item.value}</p>
              </div>
              <item.icon className={`w-5 h-5 ${item.status === "healthy" ? "text-green-400" : "text-primary"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
