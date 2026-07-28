"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wand2, FolderKanban, Sparkles, ArrowRight, Plus,
  Clock, CheckCircle2, Loader2, TrendingUp, Users, Download,
  ChevronRight, Eye, Star, Zap, Activity
} from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { mockActivityLog, mockUsageStats } from "@/lib/api/mock-db";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

const statusConfig = {
  completed: { label: "Completed", color: "badge-success", icon: CheckCircle2 },
  generating: { label: "Generating", color: "badge-warning", icon: Loader2 },
  draft: { label: "Draft", color: "badge-info", icon: Clock },
  archived: { label: "Archived", color: "badge-info", icon: Clock },
};

function MiniBarChart({ data, color = "var(--primary)" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.slice(-12).map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all duration-500" style={{
          height: `${(v / max) * 100}%`,
          backgroundColor: i === data.length - 1 ? color : color + "55",
        }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { projects, generatePlan } = useProjectStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [generatingId, setGeneratingId] = React.useState<string | null>(null);
  const userStats = user ? {
    aiGenerations: { used: user.aiCreditsUsed, total: user.aiCreditsTotal, history: mockUsageStats.aiGenerations.history },
    storage: { usedMb: user.storageUsedMb, totalMb: user.storageQuotaMb },
    projects: { count: projects.length, limit: 50 },
    exports: { count: mockUsageStats.exports.count, limit: mockUsageStats.exports.limit },
  } : mockUsageStats;
  const recentProjects = projects.slice(0, 3);

  const handleQuickGenerate = async (id: string) => {
    setGeneratingId(id);
    await generatePlan(id);
    setGeneratingId(null);
    addToast("Plan generated successfully!", "success");
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] || "there"} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
        <Link href="/generate" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all text-sm">
          <Wand2 className="w-4 h-4" /> Generate New Plan
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard title="Total Projects" value={projects.length} trend={12} trendLabel="vs last month" icon={<FolderKanban className="w-5 h-5" />} iconColor="bg-blue-50 text-primary dark:bg-blue-950/30" />
        <StatCard title="AI Credits Used" value={`${userStats.aiGenerations.used}/${userStats.aiGenerations.total}`} subtitle={`${Math.round(userStats.aiGenerations.used / userStats.aiGenerations.total * 100)}% consumed`} icon={<Sparkles className="w-5 h-5" />} iconColor="bg-violet-50 text-violet-600 dark:bg-violet-950/30" />
        <StatCard title="AI Generations" value={userStats.aiGenerations.used} trend={8} trendLabel="this month" icon={<Activity className="w-5 h-5" />} iconColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" />
        <StatCard title="Project Rooms" value={projects.reduce((sum, p) => sum + p.rooms.length, 0)} trend={3} icon={<Download className="w-5 h-5" />} iconColor="bg-amber-50 text-amber-600 dark:bg-amber-950/30" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg">Recent Projects</h2>
              <Link href="/dashboard/projects" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentProjects.map((project) => {
                const sc = statusConfig[project.status];
                const isGen = generatingId === project.id;
                return (
                  <div key={project.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 font-bold text-primary text-lg">
                      {project.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm truncate">{project.name}</p>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", sc.color)}>
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{project.plotLength}x{project.plotWidth}ft · {project.floors} Floor{project.floors > 1 ? "s" : ""} · {project.style}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/dashboard/projects/${project.id}`} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-slate-500" />
                      </Link>
                      {project.status === "draft" && (
                        <button
                          onClick={() => handleQuickGenerate(project.id)}
                          disabled={!!isGen}
                          className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                          title="Generate"
                        >
                          {isGen ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/generate" className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-medium">
                <Plus className="w-4 h-4" /> Create new project
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          {/* AI Usage */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">AI Credits</h3>
              <Link href="/dashboard/subscription" className="text-xs text-primary font-medium hover:underline">Upgrade</Link>
            </div>
            <div className="flex items-end gap-3 mb-4">
              <div>
                <div className="text-3xl font-bold">{userStats.aiGenerations.used}</div>
                <div className="text-xs text-slate-400">of {userStats.aiGenerations.total} used</div>
              </div>
              <div className="flex-1 pb-1">
                <MiniBarChart data={userStats.aiGenerations.history} />
              </div>
            </div>
            <ProgressBar value={userStats.aiGenerations.used} max={userStats.aiGenerations.total} color={userStats.aiGenerations.used / userStats.aiGenerations.total > 0.8 ? "danger" : "primary"} size="sm" />
            <p className="text-xs text-slate-400 mt-2">{userStats.aiGenerations.total - userStats.aiGenerations.used} credits remaining · Resets in 12 days</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Generate Floor Plan", href: "/generate", icon: Wand2, color: "text-primary" },
                { label: "Browse Templates", href: "/dashboard/templates", icon: Star, color: "text-amber-500" },
                { label: "Invite Teammates", href: "/dashboard/team", icon: Users, color: "text-emerald-500" },
                { label: "Hire an Architect", href: "/marketplace", icon: FolderKanban, color: "text-violet-500" },
                { label: "Upgrade Plan", href: "/dashboard/subscription", icon: Zap, color: "text-orange-500" },
              ].map(a => (
                <Link key={a.href} href={a.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <div className={cn("w-7 h-7 rounded-lg bg-current/10 flex items-center justify-center", a.color)}>
                    <a.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{a.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {mockActivityLog.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{a.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom: Marketplace CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <TrendingUp className="w-4 h-4" /> Enterprise-ready
            </div>
            <h3 className="text-xl font-bold">Need professional help?</h3>
            <p className="text-white/80 text-sm mt-1">Connect with 500+ verified architects, designers & builders.</p>
          </div>
          <Link href="/marketplace" className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-colors whitespace-nowrap text-sm shadow-lg">
            Browse Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
