"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Sun, Moon, Lightbulb,
  SlidersHorizontal, Zap,
  Sunset, Sparkles, BookOpen
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

interface LightFixture {
  id: string; name: string; type: "Ambient" | "Task" | "Accent" | "Natural";
  brightness: number; colorTemp: number; x: number; y: number; icon: string;
}

const defaultLights: LightFixture[] = [
  { id: "l1", name: "Ceiling Light", type: "Ambient", brightness: 80, colorTemp: 4000, x: 50, y: 25, icon: "💡" },
  { id: "l2", name: "Floor Lamp", type: "Accent", brightness: 50, colorTemp: 3000, x: 15, y: 60, icon: "🪔" },
  { id: "l3", name: "Desk Lamp", type: "Task", brightness: 90, colorTemp: 5000, x: 75, y: 55, icon: "🔆" },
  { id: "l4", name: "Window Light", type: "Natural", brightness: 70, colorTemp: 5500, x: 85, y: 20, icon: "☀️" },
  { id: "l5", name: "Wall Sconce", type: "Accent", brightness: 30, colorTemp: 2700, x: 25, y: 22, icon: "🕯️" },
];

const presets = [
  { name: "Day", icon: Sun, config: { ambient: 100, accent: 40, task: 80, natural: 90, temp: 5500 } },
  { name: "Night", icon: Moon, config: { ambient: 20, accent: 60, task: 30, natural: 0, temp: 2700 } },
  { name: "Evening", icon: Sunset, config: { ambient: 50, accent: 70, task: 60, natural: 20, temp: 3500 } },
  { name: "Reading", icon: BookOpen, config: { ambient: 60, accent: 30, task: 100, natural: 40, temp: 4000 } },
  { name: "Party", icon: Sparkles, config: { ambient: 80, accent: 100, task: 50, natural: 10, temp: 4500 } },
];

export default function LightingPage() {
  const { addToast } = useUIStore();
  const [lights, setLights] = React.useState<LightFixture[]>(defaultLights);
  const [selectedLight, setSelectedLight] = React.useState<string | null>(null);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  const selected = lights.find(l => l.id === selectedLight);

  const updateLight = (id: string, updates: Partial<LightFixture>) => {
    setLights(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.name);
    setLights(prev => prev.map(l => {
      const type = l.type.toLowerCase() as keyof typeof preset.config;
      const valMap: Record<string, number> = {
        ambient: preset.config.ambient,
        accent: preset.config.accent,
        task: preset.config.task,
        natural: preset.config.natural,
      };
      const brightness = valMap[type] ?? l.brightness;
      return { ...l, brightness, colorTemp: preset.config.temp };
    }));
    addToast(`Applied "${preset.name}" lighting preset`, "success");
  };

  const totalPower = lights.reduce((sum, l) => sum + l.brightness * 0.5, 0);

  const fixedLights = [
    { x: 20, y: 15, icon: "💡", type: "Ambient" },
    { x: 70, y: 18, icon: "💡", type: "Ambient" },
    { x: 30, y: 70, icon: "🪔", type: "Accent" },
    { x: 65, y: 65, icon: "🔆", type: "Task" },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Lighting Studio</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium shadow-sm transition-colors"
            onClick={() => addToast("Lighting configuration saved!", "success")}>
            <Zap className="w-3.5 h-3.5" /> Save Lighting
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto z-20 shrink-0">
          {/* Presets */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Preset Scenes</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                    activePreset === preset.name
                      ? 'bg-primary/10 text-primary border border-primary/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border border-transparent'
                  }`}
                >
                  <preset.icon className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Light Controls */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {selected ? `Controls: ${selected.name}` : 'Light Controls'}
            </h3>
            {selected ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">Brightness</span>
                    <span className="font-mono text-xs">{selected.brightness}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} value={selected.brightness}
                    onChange={e => updateLight(selected.id, { brightness: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">Color Temp</span>
                    <span className="font-mono text-xs">{selected.colorTemp}K</span>
                  </div>
                  <input
                    type="range" min={2200} max={6500} step={100} value={selected.colorTemp}
                    onChange={e => updateLight(selected.id, { colorTemp: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Warm</span>
                    <span>Cool</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Type</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    selected.type === 'Ambient' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    selected.type === 'Task' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    selected.type === 'Accent' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>{selected.type}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click a light fixture to adjust</p>
            )}
          </div>

          {/* Energy Usage */}
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Energy Usage</h3>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalPower.toFixed(1)} W</div>
              <p className="text-xs text-slate-500 mt-1">Estimated hourly consumption</p>
            </div>
            <div className="mt-3 space-y-1">
              {lights.map(l => (
                <div key={l.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{l.name}</span>
                  <span className="font-mono">{(l.brightness * 0.5).toFixed(1)}W</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Room View with Light Placement */}
        <main className="flex-1 relative overflow-hidden bg-zinc-900">
          {/* Room Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, 
                  hsl(${220 + (lights[0]?.colorTemp || 4000) / 100}, 30%, ${10 + lights[0]?.brightness * 0.15}%) 0%,
                  hsl(${220 + (lights[1]?.colorTemp || 3000) / 100}, 25%, ${15 + lights[1]?.brightness * 0.1}%) 100%)`
              }}
            />
          </div>

          {/* Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-zinc-800/60"
            style={{ opacity: 0.3 + lights.reduce((s, l) => s + l.brightness, 0) / 500 }}
          />

          {/* Room Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] border border-zinc-700/50 rounded-lg">
            {/* Walls */}
            <div className="absolute top-0 left-0 w-[55%] h-full border-r border-zinc-700/30" />
            <div className="absolute top-0 right-0 w-[45%] h-[55%] border-b border-zinc-700/30" />

            {/* Window */}
            <div className="absolute top-4 right-8 w-16 h-24 bg-blue-500/10 border border-blue-400/20 rounded-sm"
              style={{ opacity: 0.3 + (lights.find(l => l.type === 'Natural')?.brightness || 0) / 100 * 0.7 }}
            />

            {/* Light Fixtures */}
            {fixedLights.map((fl, i) => {
              const light = lights[i] || lights[0];
              const isSelected = selectedLight === light.id;
              const brightness = light.brightness / 100;
              return (
                <button
                  key={light.id}
                  onClick={() => setSelectedLight(light.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${
                    isSelected ? 'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-zinc-900 rounded-full' : ''
                  }`}
                  style={{ left: `${fl.x}%`, top: `${fl.y}%` }}
                >
                  <div className="relative">
                    <span className="text-xl">{fl.icon}</span>
                    {/* Light glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-xl transition-all duration-500"
                      style={{
                        backgroundColor: `hsl(${40 - (light.colorTemp - 2200) / 100}, 80%, 50%)`,
                        opacity: brightness * 0.4,
                        transform: `scale(${1 + brightness * 0.5})`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span>{lights.filter(l => l.brightness > 20).length} active lights</span>
          <span>{activePreset || 'Custom'} scene</span>
        </div>
        <div className="flex gap-4">
          <span>{totalPower.toFixed(1)}W</span>
          <span>Avg: {(lights.reduce((s, l) => s + l.colorTemp, 0) / lights.length).toFixed(0)}K</span>
        </div>
      </footer>
    </div>
  );
}
