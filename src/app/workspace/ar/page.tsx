"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Camera, Move3d, RotateCcw, Maximize2,
  Grid3x3, Crosshair, Ruler, GripHorizontal, Info,
  Sun, Moon, Target, Navigation, CircleDot
} from "lucide-react";

export default function WorkspaceARPage() {
  const [placementMode, setPlacementMode] = React.useState<"ground" | "rotate" | "scale">("ground");
  const [scale, setScale] = React.useState(50);
  const [rotation, setRotation] = React.useState(0);
  const [surfaceDetected, setSurfaceDetected] = React.useState(true);
  const [isTracking, setIsTracking] = React.useState(true);
  const [showInfo, setShowInfo] = React.useState(true);
  const [measuring, setMeasuring] = React.useState(false);
  const [measurePoints, setMeasurePoints] = React.useState<{ x: number; y: number }[]>([]);

  const handlePlaceOnGround = () => {
    setPlacementMode("ground");
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (measuring) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMeasurePoints(prev => [...prev, { x, y }]);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-black overflow-hidden select-none">
      {/* Top Bar */}
      <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="px-4 py-2 rounded-lg font-semibold text-sm backdrop-blur-md shadow-sm bg-black/50 text-slate-200 flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-primary" />
            AR Workspace
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg p-1 bg-black/50 backdrop-blur-md">
            <Link href="/workspace/2d" className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors">2D</Link>
            <Link href="/workspace/3d" className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors">3D</Link>
            <button className="px-3 py-1 text-xs font-semibold bg-slate-800 text-white rounded-md shadow">AR</button>
            <Link href="/workspace/vr" className="px-3 py-1 text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors">VR</Link>
          </div>
        </div>
      </header>

      {/* Camera View Placeholder */}
      <main className="flex-1 relative overflow-hidden" onClick={handleCanvasClick}>
        {/* Dark background with camera grain */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

        {/* Viewfinder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-3/4 h-3/4 max-w-2xl max-h-[500px]">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/60 rounded-tl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/60 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/60 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/60 rounded-br" />
          </div>
        </div>

        {/* Detected Surfaces */}
        {surfaceDetected && (
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-40 opacity-40">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(transparent 0%, rgba(59,130,246,0.15) 50%, transparent 100%),
                linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.15) 50%, transparent 100%)
              `,
              backgroundSize: '40px 40px'
            }} />
          </div>
        )}

        {/* AR Object Preview (the building model) */}
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 z-10 transition-all"
          style={{
            transform: `translate(-50%, 0) scale(${scale / 100}) rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="w-32 h-24 bg-white/20 border-2 border-primary/50 rounded-sm backdrop-blur-sm flex items-center justify-center">
            <span className="text-primary/80 text-xs font-bold">AR Model</span>
          </div>
        </div>

        {/* Measurement Points */}
        {measurePoints.map((pt, i) => (
          <React.Fragment key={i}>
            <div
              className="absolute w-4 h-4 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 z-20 border-2 border-white shadow-lg"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            />
            {i > 0 && (
              <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
                <line
                  x1={`${measurePoints[i - 1].x}%`}
                  y1={`${measurePoints[i - 1].y}%`}
                  x2={`${pt.x}%`}
                  y2={`${pt.y}%`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="4"
                />
              </svg>
            )}
          </React.Fragment>
        ))}

        {/* World Tracking Status */}
        <div className="absolute top-20 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-xs">
          <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-300">{isTracking ? 'Tracking' : 'Lost'}</span>
        </div>

        {/* Info Overlay */}
        {showInfo && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-black/70 backdrop-blur-md rounded-xl text-xs text-slate-300 text-center max-w-xs">
            Point your device at a flat surface to place the building model. Tap to place.
          </div>
        )}
      </main>

      {/* AR Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-800 shadow-xl z-20">
        <button
          onClick={handlePlaceOnGround}
          className={`p-3 rounded-xl transition-colors ${placementMode === 'ground' ? 'bg-primary/20 text-primary' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Place on Ground"
        >
          <Navigation className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPlacementMode("rotate")}
          className={`p-3 rounded-xl transition-colors ${placementMode === 'rotate' ? 'bg-primary/20 text-primary' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Rotate"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPlacementMode("scale")}
          className={`p-3 rounded-xl transition-colors ${placementMode === 'scale' ? 'bg-primary/20 text-primary' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Scale"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-slate-700 mx-1" />
        <button
          onClick={() => setMeasuring(!measuring)}
          className={`p-3 rounded-xl transition-colors ${measuring ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Measure"
        >
          <Ruler className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-slate-700 mx-1" />
        <input
          type="range"
          min={10}
          max={200}
          value={scale}
          onChange={e => setScale(Number(e.target.value))}
          className="w-20 h-1 accent-primary"
        />
        <span className="text-xs text-slate-400 w-10">{scale}%</span>
        <div className="w-px h-8 bg-slate-700 mx-1" />
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-3 rounded-xl transition-colors ${showInfo ? 'bg-primary/20 text-primary' : 'hover:bg-slate-800 text-slate-400'}`}
          title="Info"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-black/80 border-t border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Crosshair className="w-3 h-3" />
            Surfaces: {surfaceDetected ? '4 detected' : 'Scanning...'}
          </span>
          <span>AR Core v1.2</span>
        </div>
        <div className="flex gap-4">
          <span>Tracking: {isTracking ? 'High' : 'Low'}</span>
          <span>Placed: {measurePoints.length}</span>
        </div>
      </footer>
    </div>
  );
}
