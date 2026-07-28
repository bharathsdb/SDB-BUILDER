"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Building2, Columns, Ruler,
  AlertTriangle, CheckCircle, Shield, Mountain,
  Hammer, Phone, BarChart3, Grid3x3
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

const soilTypes = [
  { name: "Clay", bearing: "150 kN/m²", icon: "🟤" },
  { name: "Sandy", bearing: "200 kN/m²", icon: "🟡" },
  { name: "Loam", bearing: "250 kN/m²", icon: "🟢" },
  { name: "Rock", bearing: "500 kN/m²", icon: "🪨" },
  { name: "Silt", bearing: "100 kN/m²", icon: "🟠" },
];

const seismicZones = ["Zone II (Low)", "Zone III (Moderate)", "Zone IV (High)", "Zone V (Very High)"];

export default function StructuralAnalysisPage() {
  const { addToast } = useUIStore();
  const [soilType, setSoilType] = React.useState(2);
  const [seismicZone, setSeismicZone] = React.useState(1);
  const [beamSpan, setBeamSpan] = React.useState(20);
  const [columns, setColumns] = React.useState(12);
  const [integrityScore] = React.useState(82);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Structural Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => addToast("Engineer consultation booked!", "success")} className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium shadow-sm transition-colors">
            <Phone className="w-3.5 h-3.5" /> Book Engineer
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Integrity Score */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Structural Integrity Score</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:opacity-30" />
                <circle
                  cx="80" cy="80" r="70" fill="none"
                  stroke={integrityScore >= 80 ? "#10b981" : integrityScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8"
                  strokeDasharray={`${(integrityScore / 100) * 440} 440`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{integrityScore}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {integrityScore >= 80 ? "Structure is sound" : integrityScore >= 60 ? "Minor concerns found" : "Major structural issues"}
            </p>
          </div>

          {/* Soil / Seismic / Load */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Soil Type */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Mountain className="w-4 h-4" /> Soil Type
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {soilTypes.map((soil, i) => (
                  <button
                    key={soil.name}
                    onClick={() => setSoilType(i)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      soilType === i
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl">{soil.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{soil.name}</p>
                      <p className="text-xs text-slate-500">Bearing: {soil.bearing}</p>
                    </div>
                    {soilType === i && <CheckCircle className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Seismic Zone */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Seismic Zone
              </h3>
              <div className="space-y-2">
                {seismicZones.map((zone, i) => (
                  <button
                    key={zone}
                    onClick={() => setSeismicZone(i)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      seismicZone === i
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm">{zone}</span>
                    {seismicZone === i && <CheckCircle className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {seismicZone >= 2 ? "Seismic reinforcement required for this zone" : "Standard construction acceptable"}
              </div>
            </div>
          </div>

          {/* Beam Span & Column Calculator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Ruler className="w-4 h-4" /> Beam Span Calculator
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-500">Span Length</span>
                    <span className="font-mono text-sm">{beamSpan} ft</span>
                  </div>
                  <input
                    type="range" min={10} max={40} value={beamSpan}
                    onChange={e => setBeamSpan(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
                    <p className="text-xs text-slate-500">Recommended Depth</p>
                    <p className="font-bold text-lg">{Math.round(beamSpan * 0.6)} in</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800">
                    <p className="text-xs text-slate-500">Steel Required</p>
                    <p className="font-bold text-lg">{(beamSpan * 0.8).toFixed(1)} tons</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Columns className="w-4 h-4" /> Column Placement Grid
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-500">Number of Columns</span>
                    <span className="font-mono text-sm">{columns}</span>
                  </div>
                  <input
                    type="range" min={6} max={24} value={columns}
                    onChange={e => setColumns(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                {/* Grid visualization */}
                <div className="aspect-square bg-slate-100 dark:bg-zinc-800 rounded-xl p-3">
                  <div className="w-full h-full grid gap-2" style={{
                    gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(columns))}, 1fr)`,
                    gridTemplateRows: `repeat(${Math.ceil(Math.sqrt(columns))}, 1fr)`,
                  }}>
                    {Array.from({ length: columns }).map((_, i) => (
                      <div key={i} className="bg-primary/20 border border-primary/40 rounded flex items-center justify-center">
                        <span className="text-[8px] text-primary/60 font-mono">C{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Foundation Recommendations */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Foundation Recommendations
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: "Shallow", depth: "3-5 ft", suitable: "Clay, Sandy", icon: "📐" },
                { type: "Deep", depth: "10-20 ft", suitable: "Silt, Loam", icon: "📏" },
                { type: "Raft", depth: "2-4 ft", suitable: "Rock, Mixed", icon: "📋" },
              ].map(f => (
                <div key={f.type} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-2xl mb-2 block">{f.icon}</span>
                  <p className="font-semibold">{f.type} Foundation</p>
                  <p className="text-xs text-slate-500 mt-1">Depth: {f.depth}</p>
                  <p className="text-xs text-slate-500">Best for: {f.suitable}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Load-bearing Walls */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Load-Bearing Wall Identification
            </h3>
            <div className="relative w-full max-w-md mx-auto aspect-[4/3] border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-800/50 rounded-lg overflow-hidden">
              {/* Simple floor plan with wall indications */}
              <svg viewBox="0 0 200 150" className="w-full h-full">
                {/* Load-bearing walls */}
                <rect x="10" y="10" width="3" height="130" fill="#ef4444" opacity="0.7" />
                <rect x="10" y="10" width="180" height="3" fill="#ef4444" opacity="0.7" />
                <rect x="187" y="10" width="3" height="130" fill="#ef4444" opacity="0.7" />
                <rect x="10" y="137" width="180" height="3" fill="#ef4444" opacity="0.7" />
                {/* Non load-bearing */}
                <rect x="100" y="10" width="2" height="80" fill="#3b82f6" opacity="0.4" />
                <rect x="10" y="80" width="90" height="2" fill="#3b82f6" opacity="0.4" />
                {/* Labels */}
                <text x="50" y="45" fontSize="6" fill="#ef4444" opacity="0.8">Load-bearing</text>
                <text x="105" y="45" fontSize="6" fill="#3b82f6" opacity="0.6">Non-load</text>
              </svg>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 justify-center">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/50" /> Load-bearing</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/30" /> Non load-bearing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
