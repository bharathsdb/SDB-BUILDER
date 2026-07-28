"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Grid3x3, Upload, Layers, Eye, EyeOff,
  Type, Ruler, Crosshair, Download, FileText, Move,
  ZoomIn, ZoomOut, Settings, Save
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

interface Layer { id: string; label: string; visible: boolean; color: string; }
type Tool = "select" | "text" | "dimension" | "arrow";
type Scale = "1:50" | "1:100" | "1:200";

export default function BlueprintPage() {
  const { addToast } = useUIStore();
  const [activeTool, setActiveTool] = React.useState<Tool>("select");
  const [scale, setScale] = React.useState<Scale>("1:100");
  const [layers, setLayers] = React.useState<Layer[]>([
    { id: "structural", label: "Structural", visible: true, color: "#3b82f6" },
    { id: "electrical", label: "Electrical", visible: true, color: "#f59e0b" },
    { id: "plumbing", label: "Plumbing", visible: true, color: "#10b981" },
    { id: "hvac", label: "HVAC", visible: true, color: "#8b5cf6" },
  ]);
  const [annotations, setAnnotations] = React.useState<{ id: string; type: Tool; x: number; y: number; text?: string }[]>([]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const handleImportCAD = () => {
    addToast("Importing CAD file... DXF file loaded successfully!", "success");
  };

  const handleExport = (format: string) => {
    addToast(`Exporting blueprint as ${format}...`, "success");
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === "text") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setAnnotations(prev => [...prev, { id: `a${Date.now()}`, type: "text", x, y, text: "Annotation" }]);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      {/* Top Bar */}
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Hexagon className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Blueprint Viewer</span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {(["1:50", "1:100", "1:200"] as Scale[]).map(s => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  scale === s ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'text-slate-500 hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleImportCAD} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Upload className="w-3.5 h-3.5" /> Import CAD
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <button onClick={() => handleExport("DXF")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" /> DXF
          </button>
          <button onClick={() => handleExport("DWG")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" /> DWG
          </button>
          <button onClick={() => handleExport("PDF")} className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium shadow-sm transition-colors">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-14 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-2 z-20 shrink-0">
          {([
            { id: "select" as Tool, icon: Move, label: "Select" },
            { id: "text" as Tool, icon: Type, label: "Text" },
            { id: "dimension" as Tool, icon: Crosshair, label: "Dimension" },
            { id: "arrow" as Tool, icon: Crosshair, label: "Arrow" },
          ]).map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-2.5 rounded-xl transition-all ${
                activeTool === tool.id
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={tool.label}
            >
              <tool.icon className="w-5 h-5" />
            </button>
          ))}
          <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 my-2" />
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Measure">
            <Ruler className="w-5 h-5" />
          </button>
        </aside>

        {/* Blueprint Canvas */}
        <main className="flex-1 relative bg-[#1a2332]" onClick={handleCanvasClick}>
          {/* Blueprint Grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '250px 250px'
          }} />

          {/* Blueprint Drawing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-[600px] h-[400px] border-2 border-blue-400/60 bg-[#1a2332]/80">
              {/* Walls */}
              {layers.filter(l => l.visible && l.id === "structural").map(layer => (
                <React.Fragment key={layer.id}>
                  <div className="absolute top-0 left-0 w-[400px] h-[300px] border-r-2 border-b-2" style={{ borderColor: layer.color }} />
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] border-b-2" style={{ borderColor: layer.color }} />
                  <div className="absolute bottom-0 left-0 w-[280px] h-[100px] border-r-2 border-t-2" style={{ borderColor: layer.color }} />
                  <div className="absolute bottom-0 right-0 w-[120px] h-[100px] border-l-2 border-t-2" style={{ borderColor: layer.color }} />
                </React.Fragment>
              ))}
              {/* Electrical layer */}
              {layers.filter(l => l.visible && l.id === "electrical").map(layer => (
                <React.Fragment key={layer.id}>
                  <div className="absolute top-20 left-20 w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                  <div className="absolute top-20 left-20 w-20 h-px" style={{ backgroundColor: layer.color }} />
                  <div className="absolute top-20 right-20 w-3 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                  <div className="absolute top-20 right-20 w-20 h-px" style={{ backgroundColor: layer.color }} />
                </React.Fragment>
              ))}
              {/* Plumbing layer */}
              {layers.filter(l => l.visible && l.id === "plumbing").map(layer => (
                <React.Fragment key={layer.id}>
                  <div className="absolute bottom-24 left-40 w-12 h-3 rounded-full" style={{ backgroundColor: layer.color }} />
                  <div className="absolute top-40 right-12 w-3 h-16" style={{ backgroundColor: layer.color }} />
                </React.Fragment>
              ))}
              {/* HVAC layer */}
              {layers.filter(l => l.visible && l.id === "hvac").map(layer => (
                <React.Fragment key={layer.id}>
                  <div className="absolute top-8 right-20 w-16 h-8 border border-dashed rounded" style={{ borderColor: layer.color }} />
                  <text className="absolute text-[8px]" style={{ top: 10, right: 20, color: layer.color }}>AHU-01</text>
                </React.Fragment>
              ))}

              {/* Annotations */}
              {annotations.map(ann => (
                <div
                  key={ann.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 bg-blue-500/20 border border-blue-400/40 rounded text-[10px] text-blue-300"
                  style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                >
                  {ann.text}
                </div>
              ))}

              {/* Dimension Lines */}
              <div className="absolute -top-6 left-0 w-full flex items-center justify-center">
                <div className="h-px w-[95%] bg-blue-400/60 relative">
                  <div className="absolute -top-1 left-0 w-px h-2 bg-blue-400/60" />
                  <div className="absolute -top-1 right-0 w-px h-2 bg-blue-400/60" />
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-blue-400/80 font-mono">40.0 m</span>
                </div>
              </div>

              {/* Title Block */}
              <div className="absolute bottom-2 right-2 border border-blue-400/40 px-3 py-1.5 bg-[#1a2332]/90 text-[8px] text-blue-400/60 font-mono">
                <div>SCALE: {scale}</div>
                <div>DWG: A-101</div>
                <div>REV: 03</div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel - Layers */}
        <aside className="w-64 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Layers</h3>
            <div className="space-y-2">
              {layers.map(layer => (
                <div key={layer.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: layer.color }} />
                    <span className="text-sm font-medium">{layer.label}</span>
                  </div>
                  <button
                    onClick={() => toggleLayer(layer.id)}
                    className={`p-1 rounded transition-colors ${layer.visible ? 'text-slate-400' : 'text-slate-600'} hover:bg-slate-100 dark:hover:bg-slate-800`}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Properties</h3>
            <p className="text-xs text-slate-500">Select an element to view its properties.</p>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Line Weight</span>
                <span className="font-mono">0.35mm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Color</span>
                <span className="font-mono">#3B82F6</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Annotations</h3>
            <p className="text-xs text-slate-500">{annotations.length} placed</p>
          </div>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span>Scale: {scale}</span>
          <span>Layers: {layers.filter(l => l.visible).length}/{layers.length}</span>
        </div>
        <div className="flex gap-4">
          <span>Tool: {activeTool}</span>
          <span>Units: Metric</span>
        </div>
      </footer>
    </div>
  );
}
