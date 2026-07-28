"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, TreePine, Sprout, Mountain, Road,
  RefreshCw, Eye, EyeOff, Palette, Home, PanelTop,
  CloudSun, Droplets, Sparkles
} from "lucide-react";
import { useAIStore } from "@/lib/stores/ai-store";
import { useUIStore } from "@/lib/stores/ui-store";

type RoofStyle = "Flat" | "Pitched" | "Hip" | "Gable";

export default function ExteriorPage() {
  const { generateVariations, isGenerating, progress } = useAIStore();
  const { addToast } = useUIStore();
  const [showBefore, setShowBefore] = React.useState(false);
  const [roofStyle, setRoofStyle] = React.useState<RoofStyle>("Flat");
  const [materials, setMaterials] = React.useState({
    walls: "Brick",
    roofing: "Clay Tiles",
    trim: "Wood",
  });
  const [colors, setColors] = React.useState({
    facade: "#d4a574",
    roof: "#8b4513",
    trim: "#f5f5f0",
  });
  const [landscaping, setLandscaping] = React.useState({
    trees: true,
    lawn: true,
    pathway: false,
    driveway: true,
  });

  const wallMaterials = ["Brick", "Stone", "Stucco", "Wood", "Concrete", "Glass"];
  const roofMaterials = ["Clay Tiles", "Metal", "Slate", "Asphalt", "Thatch", "Green Roof"];
  const trimMaterials = ["Wood", "PVC", "Aluminum", "Stone", "Brick", "Composite"];

  const handleGenerateVariations = async () => {
    addToast("Generating exterior variations...", "info");
    await generateVariations("Modern luxury villa exterior with " + roofStyle + " roof");
    addToast("Exterior variations generated!", "success");
  };

  const roofStyles: { id: RoofStyle; icon: string }[] = [
    { id: "Flat", icon: "▬" },
    { id: "Pitched", icon: "▲" },
    { id: "Hip", icon: "◆" },
    { id: "Gable", icon: "⬠" },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Exterior Designer</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBefore(!showBefore)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showBefore ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {showBefore ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showBefore ? "After" : "Before"}
          </button>
          <button
            onClick={handleGenerateVariations}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? `${progress}%` : "Generate Variations"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto z-20 shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Roof Style</h3>
            <div className="grid grid-cols-4 gap-2">
              {roofStyles.map(rs => (
                <button
                  key={rs.id}
                  onClick={() => setRoofStyle(rs.id)}
                  className={`p-2 rounded-lg text-center transition-colors text-lg ${
                    roofStyle === rs.id
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border border-transparent'
                  }`}
                >
                  <div>{rs.icon}</div>
                  <div className="text-[9px] font-medium mt-1">{rs.id}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Exterior Materials</h3>
            {[
              { label: "Walls", value: materials.walls, set: (v: string) => setMaterials(p => ({ ...p, walls: v })), options: wallMaterials },
              { label: "Roofing", value: materials.roofing, set: (v: string) => setMaterials(p => ({ ...p, roofing: v })), options: roofMaterials },
              { label: "Trim", value: materials.trim, set: (v: string) => setMaterials(p => ({ ...p, trim: v })), options: trimMaterials },
            ].map(section => (
              <div key={section.label} className="mb-3">
                <label className="text-xs text-slate-500 mb-1 block">{section.label}</label>
                <div className="flex flex-wrap gap-1">
                  {section.options.slice(0, 4).map(opt => (
                    <button
                      key={opt}
                      onClick={() => section.set(opt)}
                      className={`px-2 py-1 text-[10px] rounded transition-colors ${
                        section.value === opt
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Color Palette</h3>
            <div className="space-y-2">
              {(["facade", "roof", "trim"] as const).map(key => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-slate-500">{key}</span>
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={e => setColors(p => ({ ...p, [key]: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Landscaping</h3>
            <div className="space-y-2">
              {(["trees", "lawn", "pathway", "driveway"] as const).map(key => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={landscaping[key]}
                    onChange={() => setLandscaping(p => ({ ...p, [key]: !p[key] }))}
                    className="rounded accent-primary"
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Elevation View */}
        <main className="flex-1 relative overflow-hidden bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-zinc-900 dark:to-zinc-950">
          {/* Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-300/40 via-sky-100/20 to-transparent dark:from-indigo-900/30 dark:via-zinc-900/20" />

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-emerald-700/20 dark:bg-emerald-900/30" />

          {/* Building */}
          <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 transition-all duration-500">
            {/* Roof */}
            <div className={`transition-colors duration-500 ${roofStyle === "Flat" ? 'h-6' : roofStyle === "Pitched" ? 'h-16' : 'h-12'}`}
              style={{
                width: roofStyle === "Flat" ? 280 : 320,
                backgroundColor: showBefore ? '#94a3b8' : colors.roof,
                clipPath: roofStyle === "Pitched" ? 'polygon(0% 100%, 50% 0%, 100% 100%)' :
                          roofStyle === "Hip" ? 'polygon(15% 100%, 50% 10%, 85% 100%)' :
                          roofStyle === "Gable" ? 'polygon(0% 100%, 25% 0%, 75% 0%, 100% 100%)' : 'none',
              }}
            />
            {/* Main Building */}
            <div className="w-[280px] h-[200px] border-2 transition-colors duration-500 flex flex-col items-center justify-center relative"
              style={{
                backgroundColor: showBefore ? '#cbd5e1' : colors.facade,
                borderColor: showBefore ? '#94a3b8' : colors.trim,
              }}
            >
              <span className="text-white/80 font-bold text-lg drop-shadow-sm">Luxury Villa</span>
              <div className="flex gap-4 mt-2">
                <div className="w-6 h-8 bg-blue-300/60 border border-white/30 rounded-sm" />
                <div className="w-8 h-12 bg-blue-300/60 border border-white/30 rounded-sm" />
                <div className="w-6 h-8 bg-blue-300/60 border border-white/30 rounded-sm" />
              </div>
              {/* Front Door */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-16 border border-white/30 transition-colors duration-500"
                style={{ backgroundColor: showBefore ? '#78716c' : colors.trim }}
              />
              {/* Trim details */}
              <div className="absolute bottom-16 left-0 right-0 h-1 transition-colors duration-500"
                style={{ backgroundColor: showBefore ? '#94a3b8' : colors.trim }} />
            </div>

            {/* Landscaping Elements */}
            {landscaping.trees && (
              <>
                <div className="absolute -bottom-8 -left-12 text-3xl">🌳</div>
                <div className="absolute -bottom-8 -right-8 text-2xl">🌲</div>
              </>
            )}
            {landscaping.lawn && (
              <div className="absolute -bottom-4 left-0 right-0 h-4 bg-emerald-500/40 rounded-b" />
            )}
            {landscaping.pathway && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-16 h-8 bg-stone-300/60 rounded" />
            )}
            {landscaping.driveway && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-zinc-400/40 rounded" />
            )}
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span>Roof: {roofStyle}</span>
          <span>Walls: {materials.walls}</span>
        </div>
        <div className="flex gap-4">
          <span>Elevation: Front</span>
          <span>Sun: {showBefore ? 'Overcast' : 'Clear'}</span>
        </div>
      </footer>
    </div>
  );
}
