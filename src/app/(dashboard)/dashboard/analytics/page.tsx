"use client";

import * as React from "react";
import { Wand2, FolderKanban, HardDrive, Users, Download, Calendar, TrendingUp, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card } from "@/components/ui";

const stats = [
  { name: "AI Generations", value: "48", icon: Wand2, trend: "+15 this month", color: "text-primary", bg: "bg-primary/10" },
  { name: "Projects", value: "12", icon: FolderKanban, trend: "+2 this week", color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Storage Used", value: "2.4 / 10 GB", icon: HardDrive, trend: "24% utilized", color: "text-amber-500", bg: "bg-amber-500/10" },
  { name: "Team Members", value: "5", icon: Users, trend: "+1 this month", color: "text-purple-500", bg: "bg-purple-500/10" },
];

const generationsData = [
  { month: "Jan", count: 20 },
  { month: "Feb", count: 35 },
  { month: "Mar", count: 28 },
  { month: "Apr", count: 45 },
  { month: "May", count: 38 },
  { month: "Jun", count: 48 },
];

const projectTypes = [
  { type: "Residential", count: 6, percent: 50, color: "bg-primary" },
  { type: "Commercial", count: 3, percent: 25, color: "bg-blue-500" },
  { type: "Renovation", count: 2, percent: 17, color: "bg-purple-500" },
  { type: "Landscape", count: 1, percent: 8, color: "bg-amber-500" },
];

const storageBreakdown = [
  { category: "Projects", size: "1.2 GB", percent: 50, color: "bg-primary" },
  { category: "Exports", size: "0.6 GB", percent: 25, color: "bg-blue-500" },
  { category: "Assets", size: "0.4 GB", percent: 17, color: "bg-purple-500" },
  { category: "Other", size: "0.2 GB", percent: 8, color: "bg-amber-500" },
];

const maxGeneration = Math.max(...generationsData.map((d) => d.count));

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState("6m");

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Usage Analytics</h1>
          <p className="text-slate-500">Track your platform usage and project metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="secondary" onClick={() => {}}>
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.name}
            className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800"
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
            <h3 className="text-3xl font-bold">{stat.value}</h3>
            <p className="text-xs font-medium text-slate-400 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {stat.trend}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Generations Over Time - Bar Chart */}
        <Card>
          <div className="p-6">
            <h3 className="font-bold mb-1">AI Generations Over Time</h3>
            <p className="text-sm text-slate-500 mb-6">Monthly generation count</p>
            <div className="flex items-end gap-3 h-48">
              {generationsData.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / maxGeneration) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full bg-primary/20 rounded-t-lg relative"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / maxGeneration) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                      style={{ height: `${(d.count / maxGeneration) * 100}%` }}
                    />
                  </motion.div>
                  <span className="text-xs text-slate-500 font-medium">{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Project Types - Pie Chart (CSS) */}
        <Card>
          <div className="p-6">
            <h3 className="font-bold mb-1">Project Types</h3>
            <p className="text-sm text-slate-500 mb-6">Breakdown by category</p>
            <div className="flex items-center gap-8">
              <div className="relative w-40 h-40 rounded-full overflow-hidden" style={{
                background: `conic-gradient(
                  var(--color-primary) 0% 50%,
                  #3b82f6 50% 75%,
                  #a855f7 75% 92%,
                  #f59e0b 92% 100%
                )`
              }}>
                <div className="absolute inset-3 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-slate-500">Total</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {projectTypes.map((t) => (
                  <div key={t.type} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${t.color.replace("bg-", "bg-")}`} style={{ backgroundColor: t.color === "bg-primary" ? "var(--color-primary)" : undefined }} />
                    <div>
                      <p className="text-sm font-medium">{t.type}</p>
                      <p className="text-xs text-slate-500">{t.count} projects ({t.percent}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Storage Breakdown */}
      <Card>
        <div className="p-6">
          <h3 className="font-bold mb-1">Storage Breakdown</h3>
          <p className="text-sm text-slate-500 mb-6">How your storage is being used</p>
          <div className="space-y-4">
            {storageBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-slate-500">{item.size}</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
