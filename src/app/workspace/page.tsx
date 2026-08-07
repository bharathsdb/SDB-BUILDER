"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Hexagon, MousePointer2, Move, Square, DoorOpen, Expand, Focus,
  Settings, Undo, Redo, ZoomIn, ZoomOut, Save, Download, Play, Sparkles,
  ChevronRight, ArrowLeft, QrCode, Share2, X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function WorkspacePage() {
  const [activeTool, setActiveTool] = React.useState("select");
  const [rightPanel, setRightPanel] = React.useState("properties");
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = React.useState(false);

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select (V)" },
    { id: "move", icon: Move, label: "Pan (Space)" },
    { divider: true },
    { id: "wall", icon: Square, label: "Draw Wall (W)" },
    { id: "room", icon: Expand, label: "Add Room (R)" },
    { id: "door", icon: DoorOpen, label: "Add Door (D)" },
    { id: "window", icon: Focus, label: "Add Window (O)" },
  ];

  return (
    <div className="mobile-screen-h w-full flex flex-col bg-slate-100 dark:bg-zinc-950 overflow-hidden select-none">
      
      {/* Top Toolbar */}
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-2 sm:px-4 shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/dashboard" className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Hexagon className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[220px]">Luxury Villa - Ground Floor</span>
          </div>
          
          <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
          
          <div className="hidden lg:flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300">File</button>
            <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300">Edit</button>
            <button className="px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-slate-600 dark:text-slate-300">View</button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 sm:p-1">
            <button className="px-2.5 sm:px-3 py-1 text-xs font-semibold bg-white dark:bg-zinc-700 shadow rounded-md">2D</button>
            <Link href="/viewer-3d" className="px-2.5 sm:px-3 py-1 text-xs font-medium text-slate-500 hover:text-foreground transition-colors">3D</Link>
          </div>
          
          <div className="hidden sm:flex items-center gap-1">
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Undo (Ctrl+Z)">
              <Undo className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Redo (Ctrl+Y)">
              <Redo className="w-4 h-4" />
            </button>
          </div>
          
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs font-medium">
            <Save className="w-4 h-4" /> <span className="hidden md:inline">Save</span>
          </button>
          <button onClick={() => setShowQRModal(true)} className="p-1.5 sm:px-3 sm:py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs font-medium" title="Share">
            <QrCode className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors text-xs sm:text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
            className={`lg:hidden p-1.5 rounded-lg border transition-colors ${
              mobilePanelOpen ? 'bg-primary text-white border-primary' : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Toggle Properties/Copilot"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Toolbar Desktop Sidebar */}
        <aside className="hidden lg:flex w-14 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex-col items-center py-4 gap-2 z-20 shrink-0">
          {tools.map((tool, i) => {
            if (tool.divider) {
              return <div key={i} className="w-8 h-px bg-slate-200 dark:bg-slate-800 my-2" />;
            }
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as string)}
                title={tool.label}
                className={`p-2.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                }`}
              >
                {tool.icon && <tool.icon className="w-5 h-5" />}
              </button>
            );
          })}
        </aside>

        {/* Mobile Floating Horizontal Tool Dock */}
        <div className="lg:hidden absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl backdrop-blur-md shadow-2xl border bg-white/90 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 max-w-[95vw] overflow-x-auto no-scrollbar">
          {tools.map((tool, i) => {
            if (tool.divider) return <div key={i} className="w-px h-6 bg-slate-200 dark:bg-zinc-800 mx-0.5 shrink-0" />;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as string)}
                title={tool.label}
                className={`p-2.5 rounded-xl transition-all shrink-0 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tool.icon && <tool.icon className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {/* Center Canvas */}
        <main className="flex-1 relative bg-[#e2e8f0] dark:bg-[#09090b] overflow-hidden">
          
          {/* Blueprint Grid Background (Major & Minor Grid) */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #3b82f6 2px, transparent 2px),
                linear-gradient(to bottom, #3b82f6 2px, transparent 2px),
                linear-gradient(to right, #3b82f6 1px, transparent 1px),
                linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
              `,
              backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
              backgroundPosition: '-2px -2px, -2px -2px, -1px -1px, -1px -1px'
            }}
          />

          {/* Canvas Viewport Controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="glass-card dark:glass-card-dark p-1 rounded-lg flex shadow-md">
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><ZoomOut className="w-4 h-4" /></button>
              <div className="flex items-center px-3 text-xs font-bold text-slate-500">100%</div>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><ZoomIn className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Simulated Plan Drawing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[80%] max-w-[650px] aspect-[3/2] min-h-[240px] bg-white shadow-2xl border-4 border-slate-800 relative transition-all">
            {/* Walls & Rooms placeholder */}
            <div className="absolute top-0 left-0 w-[65%] h-full border-r-4 border-slate-800 bg-slate-50 flex items-center justify-center relative">
              <span className="text-slate-400 font-bold tracking-widest text-xs sm:text-base md:text-lg uppercase">Living Area</span>
              <div className="absolute top-1/2 left-0 -translate-x-1/2 w-3 sm:w-4 h-12 sm:h-16 bg-white border-y-4 border-slate-800" /> {/* Door */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 sm:w-32 h-3 sm:h-4 bg-blue-200 border-x-4 border-slate-800" /> {/* Window */}
            </div>
            <div className="absolute top-0 right-0 w-[35%] h-[50%] border-b-4 border-slate-800 bg-slate-100 flex items-center justify-center">
              <span className="text-slate-400 font-bold tracking-widest text-[10px] sm:text-sm uppercase">Kitchen</span>
            </div>
            <div className="absolute bottom-0 right-0 w-[35%] h-[50%] bg-slate-100 flex items-center justify-center">
              <span className="text-slate-400 font-bold tracking-widest text-[10px] sm:text-sm uppercase">Bath</span>
            </div>
            
            {/* Dimensions */}
            <div className="absolute -top-6 left-0 w-full flex items-center justify-center">
              <div className="h-px w-full bg-blue-500 relative">
                <div className="absolute -top-2 left-0 w-px h-4 bg-blue-500" />
                <div className="absolute -top-2 right-0 w-px h-4 bg-blue-500" />
                <span className="absolute -top-6 bg-[#e2e8f0] dark:bg-[#09090b] px-2 text-xs font-bold text-blue-500">30&apos; 0&quot;</span>
              </div>
            </div>
          </div>

        </main>

        {/* Right Sidebar - Responsive Mobile Drawer / Desktop Sidebar */}
        <aside className={`
          fixed lg:relative bottom-0 left-0 right-0 lg:left-auto lg:right-auto lg:bottom-auto
          w-full lg:w-80 max-h-[65vh] lg:max-h-none bg-white dark:bg-zinc-900 
          border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 
          flex flex-col z-40 shrink-0 rounded-t-2xl lg:rounded-none shadow-2xl lg:shadow-none
          transition-transform duration-300
          ${mobilePanelOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          ${rightPanel === "none" ? 'lg:translate-x-full lg:absolute lg:right-0 lg:h-full' : 'lg:translate-x-0'}
        `}>
          {/* Mobile Handle Bar */}
          <div className="lg:hidden flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800">
            <div className="w-10 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto" />
            <button 
              onClick={() => setMobilePanelOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          
          {/* Right Panel Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-2 shrink-0">
            <button 
              onClick={() => setRightPanel("properties")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${rightPanel === 'properties' ? 'bg-slate-100 dark:bg-slate-800 text-foreground shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              Properties
            </button>
            <button 
              onClick={() => setRightPanel("ai")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${rightPanel === 'ai' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <Sparkles className="w-3 h-3" /> Copilot
            </button>
          </div>

          {/* Properties Panel */}
          {rightPanel === "properties" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Selection</h3>
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-slate-800 dark:text-slate-200">
                    <Square className="w-4 h-4 text-slate-400" /> Exterior Wall
                  </div>
                  <p className="text-xs text-slate-500">ID: W-1042</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Dimensions</h3>
                <div className="p-4 space-y-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Length</span>
                    <input type="text" defaultValue="14' 6&quot;" className="w-24 px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-right focus:outline-none focus:border-primary shadow-sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Thickness</span>
                    <input type="text" defaultValue="0' 9&quot;" className="w-24 px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-right focus:outline-none focus:border-primary shadow-sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Height (3D)</span>
                    <input type="text" defaultValue="10' 0&quot;" className="w-24 px-2 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-right focus:outline-none focus:border-primary shadow-sm" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Material</h3>
                <button className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-orange-100 border border-orange-200 shadow-sm rounded-md" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Red Brick</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* AI Copilot Panel */}
          {rightPanel === "ai" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-primary/5">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-slate-100 dark:border-slate-700">
                    Hi! I&apos;m your AI Architect Copilot. I can help you modify this layout, optimize the space, or analyze costs. What would you like to do?
                  </div>
                </div>
                
                <div className="pl-11 space-y-2">
                  <button className="block w-full text-left px-3 py-2 text-xs font-medium text-primary bg-white dark:bg-zinc-800 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors shadow-sm">
                    &quot;Increase living room size by 20%&quot;
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-xs font-medium text-primary bg-white dark:bg-zinc-800 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors shadow-sm">
                    &quot;Add an attached bathroom to the master&quot;
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-xs font-medium text-primary bg-white dark:bg-zinc-800 rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors shadow-sm">
                    &quot;Check Vastu compliance&quot;
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-slate-800">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Ask AI to modify..." 
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button className="absolute right-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    <Play className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </aside>

      </div>
      
      {/* Status Bar */}
      <footer className="h-6 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 uppercase tracking-widest z-20">
        <div className="flex gap-4">
          <span>X: 104.5</span>
          <span>Y: -42.0</span>
          <span>Grid: 1&apos; 0&quot;</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span> Syncing</span>
          <span>Version 2.4</span>
        </div>
      </footer>

      {/* QR Code Share Modal */}
      {showQRModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center relative">
            <button 
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-2">Share Project</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">Scan this QR code to open the 3D viewer on your mobile device.</p>
            <div className="bg-white p-4 rounded-xl shadow-inner mb-6">
              <QRCodeSVG value={typeof window !== 'undefined' ? window.location.href : 'https://plancraft.ai'} size={180} />
            </div>
            <button 
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-sm font-semibold rounded-xl transition-colors"
            >
              <Share2 className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
