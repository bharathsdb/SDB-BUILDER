"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, DollarSign, PieChart, TrendingUp,
  Download, Save, BarChart3, Layers, ChevronRight, FileText
} from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { useAIStore } from "@/lib/stores/ai-store";
import { useUIStore } from "@/lib/stores/ui-store";

const budgetTiers = ["Economy", "Standard", "Premium", "Ultra Luxury"];

const categoryColors: Record<string, string> = {
  foundation: "#3b82f6", concrete: "#10b981", steel: "#f59e0b",
  brick: "#ef4444", flooring: "#8b5cf6", plumbing: "#06b6d4",
  electrical: "#f97316", labor: "#ec4899",
};

export default function CostAnalysisPage() {
  const { currentProject } = useProjectStore();
  const { estimateCost, isGenerating } = useAIStore();
  const { addToast } = useUIStore();

  const [costs, setCosts] = React.useState<Record<string, number> | null>(
    currentProject?.costEstimate ? Object.fromEntries(
      Object.entries(currentProject.costEstimate).filter(([k]) => k !== 'total')
    ) : null
  );
  const [total, setTotal] = React.useState(currentProject?.costEstimate?.total || 0);
  const [budgetTier, setBudgetTier] = React.useState(currentProject?.budgetTier || "Standard");

  const handleSave = () => {
    addToast("Cost estimate saved to project!", "success");
  };

  const handleExport = () => {
    addToast("Exporting cost report as PDF...", "success");
  };

  React.useEffect(() => {
    if (!costs && currentProject) {
      (async () => {
        const data = await estimateCost(currentProject.id);
        setCosts(Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'total')));
        setTotal(data.total);
        addToast("Cost estimate generated!", "success");
      })();
    }
  }, []);

  const handleEstimate = async () => {
    if (currentProject) {
      const data = await estimateCost(currentProject.id);
      setCosts(Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'total')));
      setTotal(data.total);
      addToast("Cost estimate generated!", "success");
    }
  };

  const maxVal = Math.max(...Object.values(costs || {}), 1);

  const pieSegments = costs ? Object.entries(costs).map(([key, val]) => ({
    label: key, value: val, color: categoryColors[key] || "#6366f1",
    percentage: total > 0 ? (val / total) * 100 : 0,
  })).sort((a, b) => b.value - a.value) : [];

  const piePaths = pieSegments.reduce<((typeof pieSegments)[number] & { startPercent: number; endPercent: number })[]>((acc, seg) => {
    const startPercent = acc.length > 0 ? acc[acc.length - 1].endPercent : 0;
    acc.push({ ...seg, startPercent, endPercent: startPercent + seg.percentage });
    return acc;
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Cost Estimator</span>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {budgetTiers.map(tier => (
              <button
                key={tier}
                onClick={() => setBudgetTier(tier)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  budgetTier === tier ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-slate-500 hover:text-foreground'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium shadow-sm transition-colors">
            <FileText className="w-3.5 h-3.5" /> Generate Report
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Total Cost Hero */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <p className="text-sm text-slate-500 mb-2">Total Estimated Cost</p>
            <h1 className="text-5xl font-bold text-primary mb-2">${total.toLocaleString()}</h1>
            <p className="text-sm text-slate-400">{budgetTier} Tier | {currentProject?.name}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4" /> Cost Breakdown
              </h3>
              <div className="flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-48 h-48 -rotate-90">
                  {piePaths.map(seg => {
                    if (seg.percentage <= 0) return null;
                    const startAngle = (seg.startPercent / 100) * 360;
                    const endAngle = (seg.endPercent / 100) * 360;
                    const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
                    return (
                      <path
                        key={seg.label}
                        d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={seg.color}
                        opacity={0.85}
                      />
                    );
                  })}
                  <circle cx="100" cy="100" r="50" className="fill-white dark:fill-zinc-900" />
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {pieSegments.slice(0, 6).map(seg => (
                  <div key={seg.label} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: seg.color }} />
                    <span className="capitalize text-slate-600 dark:text-slate-300">{seg.label}</span>
                    <span className="ml-auto font-mono">${seg.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Category Breakdown
              </h3>
              <div className="space-y-3">
                {pieSegments.map(seg => (
                  <div key={seg.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize text-slate-600 dark:text-slate-300">{seg.label}</span>
                      <span className="font-mono text-xs text-slate-500">
                        ${seg.value.toLocaleString()} ({seg.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(seg.value / maxVal) * 100}%`, backgroundColor: seg.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget Comparison */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Budget Tier Comparison</h3>
            <div className="grid grid-cols-4 gap-4">
              {budgetTiers.map(tier => {
                const multiplier = tier === "Economy" ? 0.6 : tier === "Standard" ? 1 : tier === "Premium" ? 1.4 : 2;
                const tierTotal = Math.round(total * multiplier);
                return (
                  <button
                    key={tier}
                    onClick={() => setBudgetTier(tier)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      budgetTier === tier
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{tier}</p>
                    <p className="text-xl font-bold mt-1 text-primary">${tierTotal.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {multiplier > 1 ? `+${Math.round((multiplier - 1) * 100)}%` : multiplier < 1 ? `-${Math.round((1 - multiplier) * 100)}%` : 'Base'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Re-estimate */}
          <div className="text-center">
            <button
              onClick={handleEstimate}
              disabled={isGenerating}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? "Estimating..." : "Re-calculate Estimate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
