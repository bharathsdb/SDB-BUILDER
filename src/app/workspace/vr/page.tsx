"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Eye, Navigation, Move3d,
  Ruler, Layers, Activity, Wifi, Zap, Monitor,
  Maximize2
} from "lucide-react";

interface TeleportZone {
  id: string; label: string; x: number; y: number;
}

export default function WorkspaceVRPage() {
  const [currentFloor, setCurrentFloor] = React.useState(0);
  const [activeTeleport, setActiveTeleport] = React.useState<string | null>(null);
  const [fps, setFps] = React.useState(72);
  const [latency, setLatency] = React.useState(25);
  const [showStats, setShowStats] = React.useState(true);

  const floors = ["Ground Floor", "First Floor"];

  const teleportZones: TeleportZone[] = [
    { id: "living", label: "Living Room", x: 25, y: 40 },
    { id: "kitchen", label: "Kitchen", x: 65, y: 35 },
    { id: "bedroom", label: "Master Bedroom", x: 30, y: 65 },
    { id: "bathroom", label: "Bathroom", x: 65, y: 65 },
    { id: "dining", label: "Dining Area", x: 50, y: 50 },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFps(prev => Math.max(60, Math.min(90, prev + (Math.random() > 0.5 ? 1 : -1))));
      setLatency(Math.round(20 + Math.random() * 10));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const deviceBadges = [
    { name: "Meta Quest", icon: Eye, color: "text-purple-400" },
    { name: "Apple Vision Pro", icon: Eye, color: "text-blue-400" },
    { name: "HTC Vive", icon: Monitor, color: "text-green-400" },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-950 overflow-hidden select-none">
      {/* Top Bar */}
      <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="px-4 py-2 rounded-lg font-semibold text-sm bg-black/50 backdrop-blur-md text-slate-200 flex items-center gap-2 border border-slate-800">
            <Hexagon className="w-4 h-4 text-primary" />
            VR Workspace
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg p-1 bg-black/50 backdrop-blur-md border border-slate-800">
            <Link href="/workspace/2d" className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors">2D</Link>
            <Link href="/workspace/3d" className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors">3D</Link>
            <Link href="/workspace/ar" className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors">AR</Link>
            <button className="px-3 py-1 text-xs font-semibold bg-slate-800 text-white rounded-md shadow">VR</button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {/* VR Scene Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black" />

        {/* Dual viewport simulation */}
        <div className="absolute inset-0 flex">
          {/* Left Eye */}
          <div className="flex-1 border-r border-zinc-800/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)'
            }} />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-zinc-800/30" />
          </div>
          {/* Right Eye */}
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)'
            }} />
          </div>
        </div>

        {/* VR Lens Overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,0,0.4) 100%)'
        }} />

        {/* Floor Plan - Teleport Zones */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-[500px] h-[350px] border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm rounded-lg">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
            <div className="absolute top-0 left-0 w-full p-2 text-center">
              <span className="text-xs text-zinc-500 font-mono">{floors[currentFloor]}</span>
            </div>
            {/* Room outlines */}
            <div className="absolute top-12 left-6 w-[200px] h-[130px] border border-zinc-700/50 rounded flex items-center justify-center">
              <span className="text-[10px] text-zinc-600">Living Area</span>
            </div>
            <div className="absolute top-12 right-6 w-[120px] h-[100px] border border-zinc-700/50 rounded flex items-center justify-center">
              <span className="text-[10px] text-zinc-600">Kitchen</span>
            </div>
            <div className="absolute bottom-12 left-6 w-[150px] h-[100px] border border-zinc-700/50 rounded flex items-center justify-center">
              <span className="text-[10px] text-zinc-600">Bedroom</span>
            </div>
            <div className="absolute bottom-12 right-6 w-[100px] h-[80px] border border-zinc-700/50 rounded flex items-center justify-center">
              <span className="text-[10px] text-zinc-600">Bath</span>
            </div>

            {/* Teleport Zones */}
            {teleportZones.map(zone => (
              <button
                key={zone.id}
                onClick={() => {
                  setActiveTeleport(zone.id);
                  setTimeout(() => setActiveTeleport(null), 1500);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  activeTeleport === zone.id
                    ? 'bg-primary border-primary scale-150'
                    : 'bg-zinc-800/80 border-primary/50 group-hover:bg-primary/20 group-hover:scale-110'
                }`}>
                  <Navigation className={`w-3 h-3 ${activeTeleport === zone.id ? 'text-white' : 'text-primary/70'}`} />
                </div>
                <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] whitespace-nowrap ${
                  activeTeleport === zone.id ? 'text-primary' : 'text-zinc-500'
                }`}>
                  {zone.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hand Controllers */}
        <div className="absolute bottom-28 left-8 z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-20 bg-zinc-800/80 rounded-xl border border-zinc-700 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-primary/60" />
          </div>
          <span className="text-[10px] text-zinc-500">Left</span>
        </div>
        <div className="absolute bottom-28 right-8 z-10 flex flex-col items-center gap-2">
          <div className="w-12 h-20 bg-zinc-800/80 rounded-xl border border-zinc-700 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-primary/60" />
          </div>
          <span className="text-[10px] text-zinc-500">Right</span>
        </div>

        {/* Performance Stats */}
        {showStats && (
          <div className="absolute top-20 right-4 z-10 bg-black/70 backdrop-blur-md rounded-xl border border-zinc-800 p-3 text-[10px] font-mono space-y-1">
            <div className="flex items-center gap-2 text-green-400">
              <Activity className="w-3 h-3" /> FPS: {fps}
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Zap className="w-3 h-3" /> Latency: {latency}ms
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              Draw: 2.4M tris
            </div>
          </div>
        )}

        {/* Device Support Badges */}
        <div className="absolute bottom-8 left-4 z-10 flex gap-2">
          {deviceBadges.map(badge => (
            <div key={badge.name} className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900/80 border border-zinc-800 rounded-lg text-[10px] text-zinc-400">
              <badge.icon className={`w-3 h-3 ${badge.color}`} />
              {badge.name}
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-800 shadow-xl z-20">
        <button className="p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">
          <Move3d className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className={`p-3 rounded-xl transition-colors ${showStats ? 'bg-primary/20 text-primary' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <Activity className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-slate-700 mx-1" />
        {floors.map((floor, i) => (
          <button
            key={i}
            onClick={() => setCurrentFloor(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentFloor === i
                ? 'bg-primary text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {floor}
          </button>
        ))}
        <div className="w-px h-8 bg-slate-700 mx-1" />
        <button className="p-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">
          <Ruler className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-xl bg-primary/20 text-primary transition-colors">
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-black/80 border-t border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> HMD Connected
          </span>
          <span>{floors[currentFloor]}</span>
        </div>
        <div className="flex gap-4">
          <span>Room-Scale</span>
          <span>Battery: 87%</span>
        </div>
      </footer>
    </div>
  );
}
