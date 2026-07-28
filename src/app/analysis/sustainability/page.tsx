"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Leaf, Droplets, Zap, Sun, CloudRain,
  Award, CheckCircle, Lightbulb, Recycle, Wind, TreePine
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

export default function SustainabilityPage() {
  const { addToast } = useUIStore();

  const [energyScore] = React.useState(78);
  const [waterScore] = React.useState(62);
  const [carbonFootprint] = React.useState(24.5);
  const [solarPanels] = React.useState(false);
  const [rainwaterHarvesting, setRainwaterHarvesting] = React.useState(false);

  const certifications = [
    { name: "LEED", icon: Award, level: "Silver", score: 65, color: "text-slate-600" },
    { name: "GRIHA", icon: Leaf, level: "4-Star", score: 72, color: "text-green-600" },
    { name: "IGBC", icon: Recycle, level: "Gold", score: 58, color: "text-blue-600" },
  ];

  const suggestions = [
    "Install solar panels to reduce grid dependency by 40%",
    "Implement rainwater harvesting system",
    "Use low-flow fixtures to reduce water consumption by 30%",
    "Add green roof for natural insulation",
    "Use recycled materials for construction",
    "Install energy-efficient LED lighting throughout",
  ];

  const overallScore = Math.round((energyScore + waterScore + (100 - carbonFootprint * 2)) / 3);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Sustainability Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => addToast("Sustainability report exported!", "success")} className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium shadow-sm transition-colors">
            <Leaf className="w-3.5 h-3.5" /> Generate Report
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Overall Score */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Overall Sustainability Score</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:opacity-30" />
                <circle
                  cx="80" cy="80" r="70" fill="none" stroke={overallScore >= 70 ? "#10b981" : overallScore >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8"
                  strokeDasharray={`${(overallScore / 100) * 440} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{overallScore}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {overallScore >= 70 ? "Good sustainability practices" : overallScore >= 50 ? "Room for improvement" : "Major improvements needed"}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Energy */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Energy Efficiency</p>
                  <p className="text-2xl font-bold">{energyScore}%</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${energyScore}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">Estimated annual savings: $2,400</p>
            </div>

            {/* Water */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Water Conservation</p>
                  <p className="text-2xl font-bold">{waterScore}%</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${waterScore}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">Estimated savings: 45,000 gal/yr</p>
            </div>

            {/* Carbon */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CloudRain className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Carbon Footprint</p>
                  <p className="text-2xl font-bold">{carbonFootprint} tCO₂</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.max(0, 100 - carbonFootprint * 3)}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">Below national average by 12%</p>
            </div>
          </div>

          {/* Solar Panel Optimizer */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sun className="w-4 h-4" /> Solar Panel Placement Optimizer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="aspect-video bg-slate-100 dark:bg-zinc-800 rounded-xl relative overflow-hidden">
                {/* Simulated roof */}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                }} />
                {/* Solar panels */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-4 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-10 h-8 rounded-sm border ${solarPanels ? 'bg-blue-500/60 border-blue-400/50' : 'bg-slate-700/50 border-slate-600/50'}`}
                    />
                  ))}
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] text-white/60">Roof Surface • 40 panels max</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estimated Generation</span>
                  <span className="font-bold text-lg text-primary">8.4 kW</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Roof Area Required</span>
                  <span className="font-mono">280 sqft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Annual Savings</span>
                  <span className="font-bold text-green-600">$1,800</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payback Period</span>
                  <span className="font-mono">6.2 years</span>
                </div>
                <button
                  onClick={() => addToast("Solar optimization complete!", "success")}
                  className="w-full mt-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Optimize Placement
                </button>
              </div>
            </div>
          </div>

          {/* Rainwater Harvesting */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CloudRain className="w-4 h-4" /> Rainwater Harvesting Estimator
            </h3>
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div>
                <p className="font-medium">Annual Harvest Potential</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">52,000 gal</p>
                <p className="text-xs text-blue-500 mt-1">Based on 40&quot; annual rainfall and 2,000 sqft roof</p>
              </div>
              <button
                onClick={() => { setRainwaterHarvesting(!rainwaterHarvesting); addToast(rainwaterHarvesting ? "System removed" : "System added to plan", "success"); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  rainwaterHarvesting
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {rainwaterHarvesting ? 'Added ✓' : 'Add to Plan'}
              </button>
            </div>
          </div>

          {/* Green Materials */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TreePine className="w-4 h-4" /> Green Material Recommendations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Bamboo Flooring", saving: "40%", carbon: "-2.5t" },
                { name: "Recycled Steel", saving: "35%", carbon: "-3.2t" },
                { name: "Fly Ash Bricks", saving: "25%", carbon: "-1.8t" },
                { name: "Cork Insulation", saving: "50%", carbon: "-4.1t" },
              ].map(mat => (
                <div key={mat.name} className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                  <p className="text-sm font-medium">{mat.name}</p>
                  <p className="text-xs text-green-600 mt-1">Energy saving: {mat.saving}</p>
                  <p className="text-xs text-green-500">Carbon: {mat.carbon}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certification Badges */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" /> Certification Badges
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {certifications.map(cert => (
                <div key={cert.name} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <cert.icon className={`w-10 h-10 ${cert.color}`} />
                  <span className="font-bold text-lg">{cert.name}</span>
                  <span className="text-sm text-slate-500">{cert.level}</span>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cert.color.replace('text', 'bg')}`} style={{ width: `${cert.score}%`, opacity: 0.6 }} />
                  </div>
                  <span className="text-xs text-slate-400">{cert.score}% compliance</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Improvement Suggestions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
