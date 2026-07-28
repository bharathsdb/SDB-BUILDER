"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Hexagon, ZoomIn, ZoomOut, Maximize2, Download,
  Eye, RotateCcw, Grid3x3, Save, FileText, Home, Ruler,
  MousePointer2, Move, Square, DoorOpen, Focus, Sun, Moon,
  Layers, Sparkles, Play, Circle, Type, Crosshair, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/stores/ui-store";
import { apiClient } from "@/lib/api-client";

interface RoomData {
  id: string; name: string; type: string;
  x: number; y: number; width: number; length: number;
  color?: string; area_sqft?: number; angle?: number; confidence?: number;
}

interface WallData {
  id: string; x1: number; y1: number; x2: number; y2: number;
  thickness: number;
}

function ImageToPlanViewerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();

  const [rooms] = React.useState<RoomData[]>(() => {
    const roomsParam = searchParams.get("rooms");
    if (roomsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(roomsParam));
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });
  const [walls, setWalls] = React.useState<WallData[]>([]);
  const [imageSrc] = React.useState<string | null>(() => {
    const imageParam = searchParams.get("image");
    return imageParam ? decodeURIComponent(imageParam) : null;
  });
  const [svgSrc] = React.useState<string | null>(() => {
    const svgParam = searchParams.get("svg");
    return svgParam ? decodeURIComponent(svgParam) : null;
  });
  const [zoom, setZoom] = React.useState(100);
  const [nightMode, setNightMode] = React.useState(false);
  const [activeTool, setActiveTool] = React.useState("select");
  const [selectedRoom, setSelectedRoom] = React.useState<string | null>(null);
  const [rightPanel, setRightPanel] = React.useState<"info" | "rooms">("info");
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });

  const SCALE = 8;



  const canvasWidth = rooms.length > 0
    ? Math.max(...rooms.map(r => r.x + r.width)) * SCALE + 80
    : 700;
  const canvasHeight = rooms.length > 0
    ? Math.max(...rooms.map(r => r.y + r.length)) * SCALE + 80
    : 500;

  const getRoomColor = (room: RoomData) => room.color || "#f1f5f9";
  const getRoomBorder = (type: string) => {
    const colors: Record<string, string> = {
      living: "#3b82f6", bedroom: "#ec4899", kitchen: "#f59e0b",
      bathroom: "#6366f1", dining: "#10b981", office: "#8b5cf6",
    };
    return colors[type] || "#94a3b8";
  };
  const getRoomIcon = (type: string) => {
    const icons: Record<string, string> = {
      living: "🛋", bedroom: "🛏", kitchen: "🍳",
      bathroom: "🚿", office: "💼", dining: "🍽",
    };
    return icons[type] || "📐";
  };

  const handleExportPNG = () => {
    addToast("Exporting floor plan as PNG...", "success");
    if (imageSrc) {
      const a = document.createElement("a");
      a.href = imageSrc;
      a.download = "floor-plan.png";
      a.click();
    }
  };

  const handleExportSVG = () => {
    addToast("Exporting floor plan as SVG...", "success");
    if (svgSrc) {
      const svgContent = svgSrc.startsWith("data:") ? atob(svgSrc.split(",")[1]) : svgSrc;
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "floor-plan.svg";
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  const handleOpenInWorkspace = () => {
    const roomsEncoded = encodeURIComponent(JSON.stringify(rooms));
    router.push(`/workspace/2d?rooms=${roomsEncoded}`);
  };

  const toggleFloorPlanView = () => {
    if (svgSrc) {
      window.open(svgSrc, "_blank");
    } else if (imageSrc) {
      window.open(imageSrc, "_blank");
    }
  };

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "pan", icon: Move, label: "Pan" },
    { divider: true },
    { id: "wall", icon: Square, label: "Wall" },
    { id: "room", icon: Square, label: "Room" },
    { id: "door", icon: DoorOpen, label: "Door" },
    { id: "window", icon: Focus, label: "Window" },
    { divider: true },
    { id: "measure", icon: Ruler, label: "Measure" },
    { id: "text", icon: Type, label: "Label" },
  ];

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${nightMode ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      {/* Top Toolbar */}
      <header className={`h-14 border-b flex items-center justify-between px-4 shrink-0 z-30 transition-colors duration-500 ${
        nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className={`p-2 rounded-lg transition-colors ${
            nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'
          }`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">AI Generated Floor Plan</span>
          <Badge variant="info">{rooms.length} rooms</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(25, z - 10))} className={`p-2 rounded-lg ${nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className={`text-xs font-bold w-10 text-center ${nightMode ? 'text-zinc-400' : 'text-slate-500'}`}>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(400, z + 10))} className={`p-2 rounded-lg ${nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700 mx-2" />
          <button onClick={handleExportPNG} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${nightMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Download className="w-3.5 h-3.5" /> PNG
          </button>
          <button onClick={handleExportSVG} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${nightMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'}`}>
            <FileText className="w-3.5 h-3.5" /> SVG
          </button>
          <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700 mx-2" />
          <div className={`flex items-center rounded-lg p-0.5 border ${nightMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'}`}>
            <button className={`px-3 py-1 text-xs font-semibold shadow-sm rounded-md ${nightMode ? 'bg-zinc-700 text-white' : 'bg-white'}`}>2D</button>
            <button onClick={() => router.push(`/viewer-3d?rooms=${encodeURIComponent(JSON.stringify(rooms))}`)}
              className={`px-3 py-1 text-xs font-medium ${nightMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-foreground'}`}>3D</button>
          </div>
          <Button size="sm" onClick={handleOpenInWorkspace}>
            Open Editor
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className={`w-14 flex flex-col items-center py-4 gap-2 z-20 shrink-0 border-r ${nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          {tools.map((tool, i) => {
            if ("divider" in tool) return <div key={i} className={`w-8 h-px my-1 ${nightMode ? 'bg-zinc-800' : 'bg-slate-200'}`} />;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : nightMode ? 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {React.createElement(tool.icon, { className: "w-5 h-5" })}
              </button>
            );
          })}
        </aside>

        {/* Canvas Area */}
        <main
          className={`flex-1 relative overflow-hidden ${nightMode ? 'bg-[#0a0a0f]' : 'bg-[#e2e8f0]'}`}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setCursorPos({
              x: Math.round((e.clientX - rect.left) / SCALE),
              y: Math.round((e.clientY - rect.top) / SCALE),
            });
          }}
        >
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: nightMode ? 0.15 : 0.4,
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Controls Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <div className={`rounded-lg p-1 flex shadow-md border ${nightMode ? 'bg-zinc-900/90 border-zinc-700' : 'bg-white/90 border-slate-200'}`}>
              <button onClick={() => setNightMode(!nightMode)} className={`p-2 rounded-md ${nightMode ? 'hover:bg-zinc-700 text-yellow-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={toggleFloorPlanView} className={`p-2 rounded-md ${nightMode ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Floor Plan Canvas */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(-50%, -50%) scale(${zoom / 100})` }}
          >
            <div
              className={`relative shadow-2xl border-4 transition-colors duration-500 ${
                nightMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-800'
              }`}
              style={{ width: canvasWidth, height: canvasHeight }}
            >
              {imageSrc && !nightMode && (
                <img
                  src={imageSrc}
                  alt="Generated Floor Plan"
                  className="absolute inset-0 w-full h-full object-contain opacity-30 pointer-events-none"
                />
              )}

              {rooms.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-6xl mb-4 ${nightMode ? 'text-zinc-700' : 'text-slate-300'}`}>📐</div>
                    <p className={`text-sm font-medium ${nightMode ? 'text-zinc-500' : 'text-slate-400'}`}>No rooms in current plan</p>
                    <p className={`text-xs mt-1 ${nightMode ? 'text-zinc-600' : 'text-slate-400'}`}>Run AI analysis first</p>
                  </div>
                </div>
              )}

              {/* Render Rooms */}
              {rooms.map((room, idx) => {
                const x = 40;
                const y = 40 + idx * 120;
                const w = Math.max(room.width * SCALE, 60);
                const h = Math.max(room.length * SCALE, 60);
                const color = getRoomColor(room);
                const border = getRoomBorder(room.type);
                const icon = getRoomIcon(room.type);
                const isSelected = selectedRoom === room.id;

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`absolute rounded-lg flex flex-col items-center justify-center transition-all duration-200 hover:shadow-lg cursor-pointer ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{
                      left: x, top: y, width: w, height: h,
                      backgroundColor: color,
                      border: `2px solid ${border}`,
                    }}
                  >
                    <span style={{ fontSize: `${Math.min(24, Math.max(14, w / 8))}px` }}>{icon}</span>
                    <span className={`font-bold text-center leading-tight ${nightMode ? 'text-zinc-800' : 'text-slate-700'}`}
                      style={{ fontSize: `${Math.min(13, Math.max(9, w / 14))}px` }}>
                      {room.name}
                    </span>
                    <span className="text-center text-slate-500"
                      style={{ fontSize: `${Math.min(11, Math.max(8, w / 16))}px` }}>
                      {room.width}&apos;x{room.length}&apos;
                    </span>
                    {/* Window indicator */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-blue-300 border-x-2 border-b-2" style={{ borderColor: border }} />
                    {/* Door indicator */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1/4 bg-amber-200 border-y-2 border-r-2" style={{ borderColor: border }} />
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={`w-72 flex flex-col z-20 shrink-0 border-l ${nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          {/* Panel Tabs */}
          <div className={`flex border-b p-2 gap-2 shrink-0 ${nightMode ? 'border-zinc-800' : 'border-slate-200'}`}>
            {[
              { id: "info" as const, label: "Details", icon: FileText },
              { id: "rooms" as const, label: "Rooms", icon: Layers },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanel(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  rightPanel === tab.id
                    ? nightMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-slate-100 text-foreground shadow-sm'
                    : nightMode ? 'text-zinc-500 hover:bg-zinc-800/50' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-3 h-3" /> {tab.label}
              </button>
            ))}
          </div>

          {rightPanel === "info" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Plan Summary</h3>
                <div className={`p-3 rounded-lg border space-y-3 ${nightMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Rooms</span>
                    <span className="font-semibold">{rooms.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Area</span>
                    <span className="font-semibold">
                      {rooms.reduce((sum, r) => sum + (r.area_sqft || 0), 0).toFixed(0)} sqft
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Width</span>
                    <span className="font-semibold">
                      {rooms.length > 0 ? Math.max(...rooms.map(r => r.x + r.width)).toFixed(1) : 0} ft
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Length</span>
                    <span className="font-semibold">
                      {rooms.length > 0 ? Math.max(...rooms.map(r => r.y + r.length)).toFixed(1) : 0} ft
                    </span>
                  </div>
                </div>
              </div>

              {selectedRoom && (() => {
                const room = rooms.find(r => r.id === selectedRoom);
                if (!room) return null;
                return (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Selected Room</h3>
                    <div className={`p-3 rounded-lg border ${nightMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getRoomIcon(room.type)}</span>
                        <span className="font-semibold text-sm">{room.name}</span>
                        <Badge variant="info" className="text-[10px]">{room.type}</Badge>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-500">
                        <p>Width: <span className="font-medium text-slate-700">{room.width} ft</span></p>
                        <p>Length: <span className="font-medium text-slate-700">{room.length} ft</span></p>
                        <p>Area: <span className="font-medium text-slate-700">{room.area_sqft} sqft</span></p>
                        {room.confidence && <p>Confidence: <span className="font-medium text-slate-700">{room.confidence}%</span></p>}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Controls</h3>
                <div className="space-y-2 text-xs text-slate-500">
                  <p><span className="font-semibold">Zoom:</span> +/- or scroll</p>
                  <p><span className="font-semibold">Select:</span> Click a room</p>
                  <p><span className="font-semibold">Export:</span> PNG or SVG</p>
                  <p><span className="font-semibold">Edit:</span> Open in Editor</p>
                </div>
              </div>
            </div>
          )}

          {rightPanel === "rooms" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                All Rooms ({rooms.length})
              </h3>
              {rooms.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No rooms to display</p>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors border ${
                      selectedRoom === room.id
                        ? 'border-primary bg-primary/5'
                        : nightMode ? 'border-transparent hover:bg-zinc-800' : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{getRoomIcon(room.type)}</span>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium truncate">{room.name}</p>
                      <p className="text-xs text-slate-400">{room.type} &middot; {room.area_sqft} sqft</p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{room.width}&apos;x{room.length}&apos;</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Status Bar */}
      <footer className={`h-6 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono uppercase tracking-widest border-t ${nightMode ? 'bg-zinc-950 text-zinc-500 border-zinc-800' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
        <div className="flex gap-4">
          <span>X: {cursorPos.x}</span>
          <span>Y: {cursorPos.y}</span>
          <span>Tool: {activeTool}</span>
          <span>Rooms: {rooms.length}</span>
        </div>
        <div className="flex gap-4">
          <span>AI Generated Plan</span>
          <span>PlanCraftAI</span>
        </div>
      </footer>
    </div>
  );
}

export default function ImageToPlanViewerPage() {
  return (
    <React.Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-slate-100"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ImageToPlanViewerPageContent />
    </React.Suspense>
  );
}
