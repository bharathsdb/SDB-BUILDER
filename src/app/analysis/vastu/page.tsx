"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Compass, MapPin, CheckCircle,
  AlertTriangle, Sparkles, RotateCcw, RefreshCw,
  Home, Sun, Moon, Star, Navigation
} from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { useAIStore } from "@/lib/stores/ai-store";
import { useUIStore } from "@/lib/stores/ui-store";

const directions = [
  { name: "North", angle: 0, color: "#3b82f6", symbol: "N" },
  { name: "North-East", angle: 45, color: "#8b5cf6", symbol: "NE" },
  { name: "East", angle: 90, color: "#f59e0b", symbol: "E" },
  { name: "South-East", angle: 135, color: "#ef4444", symbol: "SE" },
  { name: "South", angle: 180, color: "#10b981", symbol: "S" },
  { name: "South-West", angle: 225, color: "#f97316", symbol: "SW" },
  { name: "West", angle: 270, color: "#06b6d4", symbol: "W" },
  { name: "North-West", angle: 315, color: "#ec4899", symbol: "NW" },
];

const roomVastuZones = [
  { room: "Living Room", score: 85, suggestion: "Ideal in North-East. Current placement is acceptable." },
  { room: "Master Bedroom", score: 70, suggestion: "Should be in South-West corner. Consider relocating." },
  { room: "Kitchen", score: 90, suggestion: "South-East is ideal for kitchen. Well placed." },
  { room: "Bathroom", score: 65, suggestion: "Avoid North-East. Consider West or North-West." },
  { room: "Pooja Room", score: 40, suggestion: "Must be in North-East. Currently missing." },
];

export default function VastuAnalysisPage() {
  const { currentProject } = useProjectStore();
  const { optimizeVastu, isGenerating } = useAIStore();
  const { addToast } = useUIStore();

  const [vastuScore, setVastuScore] = React.useState(65);
  const [suggestions, setSuggestions] = React.useState<string[]>([
    "Move master bedroom to southwest corner",
    "Relocate kitchen to southeast",
    "Adjust entrance facing east",
    "Add Pooja room in northeast corner",
    "Ensure Brahmasthan is clear",
  ]);
  const [currentAnalysis, setCurrentAnalysis] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);

  const runAnalysis = async () => {
    if (currentProject) {
      const result = await optimizeVastu(currentProject.id);
      setVastuScore(result.score);
      setSuggestions(result.suggestions);
      setCurrentAnalysis(true);
      addToast(`Vastu analysis complete! Score: ${result.score}`, "success");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Vastu Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAnalysis}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? "Analyzing..." : "Run Vastu Analysis"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Score + Compass */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vastu Score */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Vastu Compliance Score</h3>
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="10" className="dark:opacity-30" />
                  <circle
                    cx="80" cy="80" r="70" fill="none" stroke={vastuScore >= 80 ? "#10b981" : vastuScore >= 60 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="10"
                    strokeDasharray={`${(vastuScore / 100) * 440} 440`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{vastuScore}%</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                {vastuScore >= 80 ? "Excellent Vastu compliance" : vastuScore >= 60 ? "Moderate - some improvements needed" : "Major Vastu violations found"}
              </p>
            </div>

            {/* Vastu Compass */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4" /> Vastu Compass
              </h3>
              <div className="relative w-48 h-48" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s' }}>
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
                {/* Direction markers */}
                {directions.map(dir => (
                  <div
                    key={dir.name}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${dir.angle}deg) translateY(-80px) rotate(-${dir.angle}deg)`,
                      color: dir.color,
                    }}
                  >
                    {dir.symbol}
                  </div>
                ))}
                {/* Center */}
                <div className="absolute inset-[35%] rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-primary" />
                </div>
                {/* Needle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-1 h-16 bg-primary rounded-full origin-bottom" />
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => setRotation(r => r - 45)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                </button>
                <span className="text-xs text-slate-500">Rotate compass</span>
                <button onClick={() => setRotation(r => r + 45)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <RotateCcw className="w-4 h-4 text-slate-500 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Room-wise Compliance */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Room-wise Vastu Compliance</h3>
            <div className="space-y-3">
              {roomVastuZones.map(zone => (
                <div key={zone.room} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{zone.room}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        zone.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        zone.score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {zone.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        zone.score >= 80 ? 'bg-green-500' : zone.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${zone.score}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{zone.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> AI Suggestions
            </h3>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floor Plan Overlay */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Floor Plan with Vastu Zones</h3>
            <div className="relative w-full max-w-lg mx-auto aspect-[4/3] border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-800/50 rounded-lg overflow-hidden">
              {/* Room layout */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-[80%] h-[80%]">
                  {[
                    { label: "NW\n(Zinc)", color: "bg-purple-100/60 dark:bg-purple-900/20", zone: "Storage" },
                    { label: "N\n(Kitchen)", color: "bg-red-100/60 dark:bg-red-900/20", zone: "Kitchen" },
                    { label: "NE\n(Pooja)", color: "bg-amber-100/60 dark:bg-amber-900/20", zone: "Prayer" },
                    { label: "W\n(Dining)", color: "bg-blue-100/60 dark:bg-blue-900/20", zone: "Dining" },
                    { label: "Brahmasthan", color: "bg-green-100/60 dark:bg-green-900/20", zone: "Center" },
                    { label: "E\n(Living)", color: "bg-yellow-100/60 dark:bg-yellow-900/20", zone: "Living" },
                    { label: "SW\n(Master)", color: "bg-orange-100/60 dark:bg-orange-900/20", zone: "Bedroom" },
                    { label: "S\n(Bath)", color: "bg-pink-100/60 dark:bg-pink-900/20", zone: "Bathroom" },
                    { label: "SE\n(Study)", color: "bg-indigo-100/60 dark:bg-indigo-900/20", zone: "Study" },
                  ].map((cell, i) => (
                    <div key={i} className={`${cell.color} flex items-center justify-center text-[8px] text-center leading-tight font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700`}>
                      {cell.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
