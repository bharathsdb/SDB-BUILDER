"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const PlanCanvas2D = dynamic(() => import("@/components/workspace/PlanCanvas2D"), { ssr: false });
const PlanCanvas3D = dynamic(() => import("@/components/workspace/PlanCanvas3D"), { ssr: false });
import {
  MousePointer2, Move, Square, Expand, DoorOpen, Focus,
  Undo, Redo, ZoomIn, ZoomOut, Save, Download, FileText, Edit3, Eye,
  ChevronRight, ArrowLeft, Hexagon, Sparkles, Play, Grid3x3,
  Maximize2, Sun, Moon, Ruler, Crosshair, Circle,
  Type, QrCode, Share2, X
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useProjectStore, Room } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";

const ROOM_COLORS: Record<string, string> = {
  living: "#dbeafe",
  bedroom: "#fce7f3",
  kitchen: "#fef3c7",
  bathroom: "#e0e7ff",
  office: "#ede9fe",
  dining: "#d1fae5",
  default: "#f1f5f9",
};

const ROOM_BORDER_COLORS: Record<string, string> = {
  living: "#3b82f6",
  bedroom: "#ec4899",
  kitchen: "#f59e0b",
  bathroom: "#6366f1",
  office: "#8b5cf6",
  dining: "#10b981",
  default: "#94a3b8",
};

const ROOM_ICONS: Record<string, string> = {
  living: "🛋",
  bedroom: "🛏",
  kitchen: "🍳",
  bathroom: "🚿",
  office: "💼",
  dining: "🍽",
  default: "📐",
};

function Workspace2DContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const { currentProject, setCurrentProject, updateProject, addRoom, removeRoom, updateRoom } = useProjectStore();
  const { addToast } = useUIStore();

  React.useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  const [activeTool, setActiveTool] = React.useState("select");
  const [viewMode, setViewMode] = React.useState<"2D" | "3D">("2D");
  const [rightPanel, setRightPanel] = React.useState<"properties" | "generate" | "ai" | "none">("none");
  
  React.useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setRightPanel("properties");
    }
  }, []);
  const [genPlotWidth, setGenPlotWidth] = React.useState(40);
  const [genPlotLength, setGenPlotLength] = React.useState(60);
  const [genBedrooms, setGenBedrooms] = React.useState(3);
  const [genKitchens, setGenKitchens] = React.useState(1);
  const [genFacing, setGenFacing] = React.useState("North");
  const [genVastu, setGenVastu] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  const [generatedVariants, setGeneratedVariants] = React.useState<any[]>([]);
  const [gridSize] = React.useState(20);
  const [nightMode, setNightMode] = React.useState(false);
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  const [selectedElement, setSelectedElement] = React.useState<string | null>(null);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [aiInput, setAiInput] = React.useState("");
  const [aiMessages, setAiMessages] = React.useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your AI Architect Copilot. I can help you modify this layout, optimize the space, or analyze costs. What would you like to do?" }
  ]);
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = React.useState(false);

  // Auto-open panel on mobile when element selected
  React.useEffect(() => {
    if (selectedElement && typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobilePanelOpen(true);
    }
  }, [selectedElement]);

  // Edit Mode & Undo/Redo State
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [history, setHistory] = React.useState<Room[][]>([]);
  const [future, setFuture] = React.useState<Room[][]>([]);
  const [constraintWarnings, setConstraintWarnings] = React.useState<string[]>([]);

  const canvasRef = React.useRef<HTMLDivElement>(null);

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select (V)" },
    { id: "pan", icon: Move, label: "Pan (Space)" },
    { divider: true },
    { id: "wall", icon: Square, label: "Draw Wall (W)" },
    { id: "room", icon: Expand, label: "Add Room (R)" },
    { id: "door", icon: DoorOpen, label: "Add Door (D)" },
    { id: "window", icon: Focus, label: "Add Window (O)" },
    { divider: true },
    { id: "measure", icon: Ruler, label: "Measure (M)" },
    { id: "text", icon: Type, label: "Text (T)" },
    { id: "dimension", icon: Crosshair, label: "Dimension (Shift+D)" },
  ];

  const rooms = currentProject?.rooms || [];

  React.useEffect(() => {
    // Removed mock room injection. The project should now come with real rooms.
  }, [currentProject, updateProject]);

  const SCALE = 8;
  const canvasWidth = currentProject?.plotWidth ? currentProject.plotWidth * SCALE : 800;
  const canvasHeight = currentProject?.plotLength ? currentProject.plotLength * SCALE : 500;

  // Undo/Redo Handlers
  const pushHistory = React.useCallback((currentRooms: Room[]) => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(currentRooms))]);
    setFuture([]); // clear future on new action
  }, []);

  const handleUndo = React.useCallback(() => {
    if (history.length === 0 || !currentProject) return;
    const previousRooms = history[history.length - 1];
    setFuture(prev => [[...rooms], ...prev]);
    updateProject(currentProject.id, { rooms: previousRooms });
    setHistory(prev => prev.slice(0, -1));
  }, [history, rooms, currentProject, updateProject]);

  const handleRedo = React.useCallback(() => {
    if (future.length === 0 || !currentProject) return;
    const nextRooms = future[0];
    setHistory(prev => [...prev, [...rooms]]);
    updateProject(currentProject.id, { rooms: nextRooms });
    setFuture(prev => prev.slice(1));
  }, [future, rooms, currentProject, updateProject]);

  // Keyboard Shortcuts for Undo/Redo
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleUpdateRoomsBatch = (newRooms: Room[]) => {
    if (!currentProject) return;
    pushHistory(rooms);
    updateProject(currentProject.id, { rooms: newRooms });
    validateConstraints(newRooms);
  };

  const validateConstraints = (currentRooms: Room[]) => {
    const warnings: string[] = [];
    if (!currentProject?.vastu) return setConstraintWarnings([]);
    
    // Simple Vastu check example: Kitchen should ideally be SE or NW.
    // Assuming (0,0) is top-left (NW if facing North, but let's just do a generic check based on quadrant)
    currentRooms.forEach(room => {
      if (room.type === 'kitchen') {
        const cx = (room.x || 0) + room.width / 2;
        const cy = (room.y || 0) + room.length / 2;
        const inSouthEast = cx > currentProject.plotWidth / 2 && cy > currentProject.plotLength / 2; // Rough approximation
        if (!inSouthEast) {
          warnings.push("Vastu Alert: Kitchen is not in the South-East zone (Agni).");
        }
      }
    });
    setConstraintWarnings(warnings);
  };

  const handleAddRoom = () => {
    if (!currentProject) return;
    pushHistory(rooms);
    addRoom(currentProject.id, {
      name: "New Room",
      width: 12,
      length: 12,
      level: 0,
      x: 10,
      y: 10,
      type: "bedroom"
    });
  };

  const handleDeleteRoom = (roomId: string) => {
    if (!currentProject) return;
    pushHistory(rooms);
    removeRoom(currentProject.id, roomId);
    if (selectedElement === roomId) setSelectedElement(null);
  };


  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / SCALE);
    const y = Math.round((e.clientY - rect.top) / SCALE);
    setCursorPos({ x, y });
  };

  const getRoomTypeColor = (type?: string) => ROOM_COLORS[type || "default"] || ROOM_COLORS.default;
  const getRoomBorderColor = (type?: string) => ROOM_BORDER_COLORS[type || "default"] || ROOM_BORDER_COLORS.default;
  const getRoomIcon = (type?: string) => ROOM_ICONS[type || "default"] || ROOM_ICONS.default;

  const handleExport = React.useCallback((format: "pdf" | "png" | "svg") => {
    if (!canvasRef.current || !currentProject) return;
    addToast(`Exporting "${currentProject.name}" as ${format.toUpperCase()}...`, "success");

    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    for (const room of rooms) {
      const x = Math.random() * (canvasWidth - room.width * SCALE - 20) + 10;
      const y = Math.random() * (canvasHeight - room.length * SCALE - 20) + 10;
      const w = room.width * SCALE;
      const h = room.length * SCALE;
      const color = getRoomTypeColor(room.type);

      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = getRoomBorderColor(room.type);
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(room.name, x + w / 2, y + h / 2 - 4);
      ctx.font = "10px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(`${room.width}' × ${room.length}'`, x + w / 2, y + h / 2 + 12);
    }

    const link = document.createElement("a");
    if (format === "png") {
      link.download = `${currentProject.name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } else if (format === "svg") {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
        <rect width="${canvasWidth}" height="${canvasHeight}" fill="white" stroke="#1e293b" stroke-width="2"/>
        ${rooms.map(r => {
          const rx = Math.random() * (canvasWidth - r.width * SCALE - 20) + 10;
          const ry = Math.random() * (canvasHeight - r.length * SCALE - 20) + 10;
          const rw = r.width * SCALE;
          const rh = r.length * SCALE;
          return `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" fill="${getRoomTypeColor(r.type)}" stroke="${getRoomBorderColor(r.type)}" stroke-width="2"/>
            <text x="${rx + rw / 2}" y="${ry + rh / 2}" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b">${r.name}</text>
            <text x="${rx + rw / 2}" y="${ry + rh / 2 + 14}" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">${r.width}' × ${r.length}'</text>`;
        }).join("\n")}
      </svg>`;
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      link.download = `${currentProject.name.replace(/\s+/g, "-").toLowerCase()}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<html><head><title>${currentProject.name}</title>
          <style>body{margin:0;display:flex;justify-content:center;padding:20px;background:#e2e8f0}img{max-width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.15)}</style></head>
          <body><img src="${canvas.toDataURL("image/png")}" /></body></html>`);
        win.document.close();
      }
    }
  }, [currentProject, rooms, canvasRef, addToast, canvasWidth, canvasHeight, SCALE, getRoomTypeColor, getRoomBorderColor]);

  const handleSave = () => {
    if (currentProject) {
      updateProject(currentProject.id, { name: currentProject.name });
      addToast("Project saved!", "success");
    }
  };

  const handleAISuggest = async (text: string) => {
    setAiMessages(prev => [...prev, { role: "user", text }]);
    setAiInput("");
    setAiMessages(prev => [...prev, { role: "ai", text: `Analyzing "${text}"... Generating optimized floor plan.` }]);

    try {
      const { apiClient } = await import('@/lib/api-client');
      
      const payload = {
        plot_width: currentProject?.plotWidth || 40,
        plot_length: currentProject?.plotLength || 60,
        facing: currentProject?.facing || "East",
        style: currentProject?.style || "Modern",
        budget_tier: currentProject?.budgetTier || "Standard",
        vastu: currentProject?.vastu ?? true,
        floors: currentProject?.floors || 1,
      };

      const res = await apiClient("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok && currentProject) {
        updateProject(currentProject.id, {
          rooms: data.rooms || [],
          doors: data.doors || [],
          windows: data.windows || [],
          costEstimate: data.costEstimate || currentProject.costEstimate,
        });
        
        setAiMessages(prev => [...prev, { 
          role: "ai", 
          text: `Done! Generated ${data.rooms?.length || 0} rooms with optimized Vastu and ventilation. Check out the 2D layout and 3D preview.` 
        }]);
      } else {
        throw new Error("Failed to generate plan");
      }
    } catch (err) {
      console.error(err);
      setAiMessages(prev => [...prev, { role: "ai", text: "Sorry, I encountered an error while generating the layout. Please try again." }]);
    }
  };

  const handleGeneratePlan = async () => {
    if (!currentProject) return;
    setIsGenerating(true);
    addToast("Generating floor plan via Antigravity Engine...", "info");

    try {
      const { apiClient } = await import('@/lib/api-client');
      
      const payload = {
        plot_width: genPlotWidth,
        plot_length: genPlotLength,
        facing: genFacing,
        style: currentProject.style || "Modern",
        budget_tier: currentProject.budgetTier || "Standard",
        vastu: genVastu,
        floors: currentProject.floors || 1,
        bedrooms: genBedrooms,
        kitchens: genKitchens,
      };

      const res = await apiClient("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.variants && data.variants.length > 0) {
          setGeneratedVariants(data.variants);
          addToast("Successfully generated variants. Please select one.", "success");
        } else {
          updateProject(currentProject.id, {
            plotWidth: genPlotWidth,
            plotLength: genPlotLength,
            facing: genFacing,
            vastu: genVastu,
            rooms: data.rooms || [],
            doors: data.doors || [],
            windows: data.windows || [],
            costEstimate: data.costEstimate || currentProject.costEstimate,
          });
          addToast("Successfully generated plan. Click View in 3D!", "success");
        }
      } else {
        throw new Error(data.error || "Failed to generate plan");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate layout. Please try again.";
      addToast(errorMessage, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const menus = [
    { id: "file", label: "File", items: ["New Project", "Open...", "Save (Ctrl+S)", "Import CAD", "Export as PDF", "Export as PNG", "Export as SVG", "Print"] },
    { id: "edit", label: "Edit", items: ["Undo (Ctrl+Z)", "Redo (Ctrl+Y)", "Cut (Ctrl+X)", "Copy (Ctrl+C)", "Paste (Ctrl+V)", "Delete", "Select All"] },
    { id: "view", label: "View", items: ["Zoom In", "Zoom Out", "Fit to Screen", "Grid Lines", "Snap to Grid", "Toggle 3D View"] },
  ];

  const handleMenuAction = (item: string) => {
    setOpenMenu(null);
    if (item.includes("Export as PDF")) handleExport("pdf");
    else if (item.includes("Export as PNG")) handleExport("png");
    else if (item.includes("Export as SVG")) handleExport("svg");
    else if (item.includes("Save")) handleSave();
  };

  const isProjectIncomplete = currentProject && currentProject.rooms.length === 0;

  if (isProjectIncomplete && !isGenerating) {
    return (
      <div className={`h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 ${nightMode ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="text-center max-w-md">
          <Hexagon className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Generation Incomplete</h2>
          <p className="text-slate-500 mb-8">This project does not have any generated floor plans. The generation process may have been interrupted.</p>
          <button
            onClick={() => window.location.href = "/generate"}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg mx-auto"
          >
            <Sparkles className="w-5 h-5" />
            Go to Generator
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`mobile-screen-h w-full flex flex-col overflow-hidden select-none transition-colors duration-500 ${nightMode ? 'bg-zinc-950' : 'bg-slate-100'}`}>
      {/* Top Toolbar */}
      <header className={`h-14 border-b flex items-center justify-between px-2 sm:px-4 shrink-0 z-30 transition-colors duration-500 ${
        nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <Link href="/workspace" className={`p-1.5 sm:p-2 rounded-lg transition-colors shrink-0 ${
            nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'
          }`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-1.5 min-w-0">
            <Hexagon className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">{currentProject?.name || "Untitled"}</span>
          </div>
          <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-zinc-800 mx-1" />
          <div className="hidden lg:flex items-center gap-1">
            {menus.map(menu => (
              <div key={menu.id} className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    nightMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {menu.label}
                </button>
                {openMenu === menu.id && (
                  <div className={`absolute top-full left-0 mt-1 w-44 rounded-xl shadow-2xl border py-1 z-50 ${
                    nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
                  }`}>
                    {menu.items.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleMenuAction(item)}
                        className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                          nightMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mode Switcher 2D/3D */}
          <div className={`flex items-center rounded-lg p-0.5 border ${
            nightMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button onClick={() => setViewMode("2D")} className={`px-2.5 sm:px-3 py-1 text-xs font-semibold shadow-sm rounded-md transition-colors ${
              viewMode === "2D" ? (nightMode ? 'bg-zinc-700 text-white' : 'bg-white text-slate-800') : (nightMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
            }`}>2D</button>
            <button onClick={() => setViewMode("3D")} className={`px-2.5 sm:px-3 py-1 text-xs font-semibold shadow-sm rounded-md transition-colors ${
              viewMode === "3D" ? (nightMode ? 'bg-zinc-700 text-white' : 'bg-white text-slate-800') : (nightMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
            }`}>3D</button>
          </div>

          {/* Edit Mode Toggle & Undo/Redo */}
          {viewMode === "2D" && (
            <div className={`flex items-center rounded-lg p-0.5 border ${
              nightMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'
            }`}>
              <button 
                onClick={() => setIsEditMode(false)} 
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  !isEditMode ? (nightMode ? 'bg-zinc-700 text-white' : 'bg-white text-slate-800') : (nightMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
                title="View Mode"
              >
                <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View</span>
              </button>
              <button 
                onClick={() => setIsEditMode(true)} 
                className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  isEditMode ? (nightMode ? 'bg-zinc-700 text-white' : 'bg-white text-slate-800') : (nightMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                }`}
                title="Modify Mode"
              >
                <Edit3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Modify</span>
              </button>
            </div>
          )}

          {isEditMode && (
             <div className="hidden sm:flex items-center gap-0.5">
                <button onClick={handleUndo} disabled={history.length === 0} className={`p-1.5 rounded-md transition-colors ${history.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-zinc-800'}`}>
                  <Undo className="w-4 h-4" />
                </button>
                <button onClick={handleRedo} disabled={future.length === 0} className={`p-1.5 rounded-md transition-colors ${future.length === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-zinc-800'}`}>
                  <Redo className="w-4 h-4" />
                </button>
             </div>
          )}

          <button onClick={handleSave} className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium ${
            nightMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'
          }`} title="Save">
            <Save className="w-3.5 h-3.5" /> <span className="hidden md:inline">Save</span>
          </button>
          
          <button onClick={() => setShowQRModal(true)} className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors text-xs font-medium ${
            nightMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-600'
          }`} title="Share">
            <QrCode className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "export" ? null : "export")}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors text-xs font-medium shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export</span>
            </button>
            {openMenu === "export" && (
              <div className={`absolute top-full right-0 mt-1 w-36 rounded-xl shadow-2xl border py-1 z-50 ${
                nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                {["Export as PDF", "Export as PNG", "Export as SVG"].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleMenuAction(item)}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                      nightMode ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Right Panel Toggle Button */}
          <button
            onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
            className={`md:hidden p-1.5 rounded-lg border transition-colors ${
              mobilePanelOpen ? 'bg-primary text-white border-primary' : nightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
            title="Toggle Panel"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar - Desktop Sidebar & Mobile Floating Dock */}
        <aside className={`hidden md:flex w-14 flex-col items-center py-4 gap-2 z-20 shrink-0 border-r transition-colors duration-500 ${
          nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
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
                    : nightMode
                      ? 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-foreground'
                }`}
              >
                {React.createElement(tool.icon, { className: "w-5 h-5" })}
              </button>
            );
          })}
        </aside>

        {/* Mobile Floating Horizontal Tool Dock */}
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl backdrop-blur-md shadow-2xl border bg-white/90 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 max-w-[95vw] overflow-x-auto no-scrollbar">
          {tools.map((tool, i) => {
            if ("divider" in tool) return <div key={i} className="w-px h-6 bg-slate-200 dark:bg-zinc-800 mx-0.5 shrink-0" />;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`p-2.5 rounded-xl transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : nightMode
                      ? 'text-zinc-400 hover:bg-zinc-800'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {React.createElement(tool.icon, { className: "w-4 h-4" })}
              </button>
            );
          })}
        </div>

        {/* Center Canvas */}
        <main
          ref={canvasRef}
          className={`flex-1 relative overflow-hidden transition-colors duration-500 ${
            nightMode ? 'bg-[#0a0a0f]' : 'bg-[#e2e8f0]'
          }`}
          onMouseMove={handleMouseMove}
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
              backgroundSize: `${gridSize}px ${gridSize}px`
            }}
          />

          {/* Canvas Controls Overlay */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <div className={`rounded-lg p-1 flex shadow-md border ${
              nightMode ? 'bg-zinc-900/90 border-zinc-700' : 'bg-white/90 border-slate-200'
            }`}>
              <button onClick={() => setNightMode(!nightMode)} className={`p-2 rounded-md transition-colors ${
                nightMode ? 'hover:bg-zinc-700 text-yellow-400' : 'hover:bg-slate-100 text-slate-500'
              }`}>
                {nightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowShortcuts(!showShortcuts)} className={`p-2 rounded-md transition-colors ${
                nightMode ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-slate-100 text-slate-500'
              }`}>
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Zoom display pill */}
            <div className={`rounded-lg px-2.5 py-1.5 flex items-center shadow-md border text-xs font-bold ${
              nightMode ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300' : 'bg-white/90 border-slate-200 text-slate-600'
            }`}>
              {zoom}%
            </div>
          </div>

          {/* Keyboard Shortcuts Panel */}
          {showShortcuts && (
            <div className={`absolute top-14 left-3 z-20 rounded-xl shadow-2xl border p-4 w-64 max-w-[85vw] ${
              nightMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-slate-200'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Keyboard Shortcuts</h3>
              <div className="space-y-1.5">
                {[
                  ["V", "Select Tool"], ["W", "Wall Tool"], ["R", "Room Tool"],
                  ["D", "Door Tool"], ["O", "Window Tool"], ["M", "Measure"],
                  ["Space", "Pan Tool"], ["Ctrl+Z", "Undo"], ["Ctrl+Y", "Redo"],
                  ["Ctrl+S", "Save"], ["+/-", "Zoom In/Out"],
                ].map(([key, desc], i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className={`text-xs ${nightMode ? 'text-zinc-400' : 'text-slate-500'}`}>{desc}</span>
                    <kbd className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border ${
                      nightMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>{key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Floor Plan Canvas */}
          <div className="absolute inset-0 z-0">
            {viewMode === "2D" ? (
              <PlanCanvas2D 
                rooms={rooms} 
                doors={currentProject?.doors || []}
                windows={currentProject?.windows || []}
                selectedRoomId={selectedElement} 
                onSelectRoom={setSelectedElement} 
                nightMode={nightMode} 
                isEditMode={isEditMode}
                onUpdateRoomsBatch={handleUpdateRoomsBatch}
              />
            ) : (
              <PlanCanvas3D 
                rooms={rooms} 
                doors={currentProject?.doors || []}
                windows={currentProject?.windows || []}
                selectedRoomId={selectedElement} 
                onSelectRoom={setSelectedElement} 
                nightMode={nightMode} 
              />
            )}
          </div>
        </main>

        {/* Right Sidebar - Desktop Fixed / Mobile Sliding Bottom Sheet */}
        <aside className={`
          fixed md:relative bottom-0 left-0 right-0 md:left-auto md:right-auto md:bottom-auto
          w-full md:w-80 max-h-[70vh] md:max-h-none flex flex-col z-40 shrink-0 border-t md:border-t-0 md:border-l 
          rounded-t-2xl md:rounded-none shadow-2xl md:shadow-none transition-transform duration-300
          ${mobilePanelOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          ${nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}
        `}>
          {/* Mobile Handle Bar */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-zinc-800">
            <div className="w-10 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto" />
            <button 
              onClick={() => setMobilePanelOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Tabs */}
          <div className={`flex items-center border-b p-2 gap-2 shrink-0 ${
            nightMode ? 'border-zinc-800' : 'border-slate-200'
          }`}>
            <button
              onClick={() => setRightPanel("properties")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                rightPanel === 'properties'
                  ? nightMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-slate-100 text-foreground shadow-sm'
                  : nightMode ? 'text-zinc-500 hover:bg-zinc-800/50' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setRightPanel("generate")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                rightPanel === 'generate'
                  ? nightMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-slate-100 text-foreground shadow-sm'
                  : nightMode ? 'text-zinc-500 hover:bg-zinc-800/50' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setRightPanel("ai")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                rightPanel === 'ai'
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : nightMode ? 'text-zinc-500 hover:bg-zinc-800/50' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Copilot
            </button>
            <button onClick={() => setRightPanel("none")} className="md:hidden p-1.5 ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Properties Panel */}
          {rightPanel === "properties" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {constraintWarnings.length > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-1">
                  <h4 className="text-xs font-bold text-red-500 uppercase">Constraints</h4>
                  {constraintWarnings.map((w, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">{w}</p>
                  ))}
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project Info</h3>
                <div className={`p-3 rounded-lg border space-y-2 ${
                  nightMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className="text-sm font-medium">{currentProject?.name || "Untitled"}</p>
                  <div className="flex flex-wrap gap-1">
                    {currentProject?.plotLength && currentProject.plotWidth ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded">{currentProject.plotLength}x{currentProject.plotWidth}ft</span>
                    ) : null}
                    {currentProject?.style ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded">{currentProject.style}</span>
                    ) : null}
                    {currentProject?.facing ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded">{currentProject.facing}</span>
                    ) : null}
                    {currentProject?.budgetTier ? (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-200 dark:bg-slate-700 rounded">{currentProject.budgetTier}</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {selectedElement && (() => {
                const room = rooms.find(r => r.id === selectedElement);
                if (!room) return null;
                return (
                  <>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Selected Room</h3>
                      <div className={`p-3 rounded-lg border ${
                        nightMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2 font-medium text-sm mb-1">
                          <Expand className="w-4 h-4 text-slate-400" />
                          {room.name}
                        </div>
                        <p className="text-xs text-slate-500">ID: {room.id} | Type: {room.type || "generic"}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dimensions</h3>
                      <div className="space-y-3">
                        {[["Width", `${room.width}'`], ["Length", `${room.length}'`], ["Area", room.area ? `${room.area} sqft` : `${room.width * room.length} sqft`]].map(([label, val]) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">{label}</span>
                            <input type="text" defaultValue={val} className={`w-24 px-2 py-1 text-sm rounded font-mono text-right focus:outline-primary border ${nightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-slate-200'}`} readOnly />
                          </div>
                        ))}
                      </div>
                      
                      {isEditMode && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="w-full py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 rounded-md transition-colors"
                          >
                            Delete Room
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rooms ({rooms.length})</h3>
                  {isEditMode && (
                    <button onClick={handleAddRoom} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                      + Add Room
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedElement(room.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors border ${
                        selectedElement === room.id
                          ? 'border-primary bg-primary/5'
                          : nightMode ? 'border-transparent hover:bg-zinc-800' : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <span>{getRoomIcon(room.type)}</span>
                      <span className="flex-1 text-left font-medium">{room.name}</span>
                      <span className="text-xs text-slate-400">{room.width}&apos;x{room.length}&apos;</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate Panel */}
          {rightPanel === "generate" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Plan Generator</h3>
                <p className="text-sm text-slate-500 mb-4">Enter your requirements and Antigravity will automatically build the floor plan, walls, and architectural elements.</p>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Plot Width (ft)</label>
                      <input 
                        type="number" 
                        value={genPlotWidth} 
                        onChange={e => setGenPlotWidth(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-primary focus:ring-1 focus:ring-primary ${
                          nightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200'
                        }`} 
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Plot Length (ft)</label>
                      <input 
                        type="number" 
                        value={genPlotLength} 
                        onChange={e => setGenPlotLength(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-primary focus:ring-1 focus:ring-primary ${
                          nightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200'
                        }`} 
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Bedrooms</label>
                      <input 
                        type="number" 
                        value={genBedrooms} 
                        onChange={e => setGenBedrooms(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-primary focus:ring-1 focus:ring-primary ${
                          nightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200'
                        }`} 
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">Kitchens</label>
                      <input 
                        type="number" 
                        value={genKitchens} 
                        onChange={e => setGenKitchens(Number(e.target.value))}
                        className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-primary focus:ring-1 focus:ring-primary ${
                          nightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200'
                        }`} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Facing</label>
                    <select
                      value={genFacing}
                      onChange={e => setGenFacing(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-primary focus:ring-1 focus:ring-primary ${
                        nightMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="North">North-facing</option>
                      <option value="South">South-facing</option>
                      <option value="East">East-facing</option>
                      <option value="West">West-facing</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="vastu-toggle"
                      checked={genVastu}
                      onChange={e => setGenVastu(e.target.checked)}
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <label htmlFor="vastu-toggle" className="text-sm font-medium">Vastu enabled</label>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleGeneratePlan}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Copilot Panel */}
          {rightPanel === "ai" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-primary/[0.03]">
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'ai' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                    }`}>
                      {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${
                      msg.role === 'ai'
                        ? nightMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-slate-100'
                        : 'bg-primary/10 border-primary/20'
                    } shadow-sm border`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div className="space-y-2 pl-3">
                  {["Increase living room size by 20%", "Add an attached bathroom to the master", "Check Vastu compliance", "Generate cost estimate"].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleAISuggest(s)}
                      className="block w-full text-left px-3 py-2 text-xs font-medium text-primary rounded-lg border border-primary/20 hover:bg-primary/10 transition-colors shadow-sm"
                    >
                      &quot;{s}&quot;
                    </button>
                  ))}
                </div>
              </div>
              <div className={`p-4 border-t ${
                nightMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && aiInput.trim()) handleAISuggest(aiInput.trim()); }}
                    placeholder="Ask AI to modify..."
                    className={`w-full pl-4 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border ${
                      nightMode ? 'bg-zinc-950 border-zinc-700 text-zinc-200 placeholder-zinc-500' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    onClick={() => { if (aiInput.trim()) handleAISuggest(aiInput.trim()); }}
                    className="absolute right-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Play className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Status Bar */}
      <footer className={`h-6 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono uppercase tracking-widest z-20 border-t transition-colors duration-500 ${
        nightMode ? 'bg-zinc-950 text-zinc-500 border-zinc-800' : 'bg-slate-100 text-slate-500 border-slate-200'
      }`}>
        <div className="flex gap-4">
          <span>X: {cursorPos.x}</span>
          <span>Y: {cursorPos.y}</span>
          <span>Grid: {gridSize}&quot;</span>
          <span>Tool: {activeTool}</span>
          <span>Rooms: {rooms.length}</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${nightMode ? 'bg-green-500' : 'bg-green-600'}`}></span>
            Synced
          </span>
          <span>{currentProject?.name || "No Project"}</span>
        </div>
      </footer>

      {/* Variant Selection Modal */}
      {generatedVariants.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col ${nightMode ? 'bg-zinc-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
              <div>
                <h2 className="text-xl font-bold">Select a Layout Variant</h2>
                <p className="text-sm text-slate-500">Choose the best floor plan variant for your project.</p>
              </div>
              <button onClick={() => setGeneratedVariants([])} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh]">
              {generatedVariants.map((v, i) => (
                <div key={i} className="flex flex-col border rounded-xl overflow-hidden dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                  <div className="bg-slate-100 dark:bg-zinc-950 aspect-[4/3] relative flex items-center justify-center p-4">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)`, backgroundSize: '10px 10px' }} />
                    <div className="z-10 text-center relative flex flex-col items-center justify-center h-full w-full">
                       {/* Abstract placeholder thumbnail */}
                       <div className="w-2/3 h-2/3 border-2 border-primary/30 rounded-lg relative overflow-hidden bg-primary/5">
                          {v.rooms?.slice(0, 4).map((r: any, idx: number) => (
                            <div key={idx} className="absolute border border-primary/40 bg-primary/10 rounded-sm" style={{
                              left: `${(r.x / 40) * 100}%`,
                              top: `${(r.y / 60) * 100}%`,
                              width: `${(r.width / 40) * 100}%`,
                              height: `${(r.length / 60) * 100}%`,
                            }} />
                          ))}
                       </div>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between border-t dark:border-zinc-800">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg mb-1">{v.name || `Variant ${i + 1}`}</h3>
                      <div className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded mb-3">Overall Score: {v.scores?.overall_score?.toFixed(0) || 85}/100</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Vastu Score:</span>
                          <span className="font-medium">{v.scores?.vastu_score?.toFixed(0) || 80}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Ventilation:</span>
                          <span className="font-medium">{v.scores?.ventilation_score?.toFixed(0) || 80}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Rooms:</span>
                          <span className="font-medium">{v.rooms?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t dark:border-zinc-800">
                          <span className="text-slate-500">Est. Cost:</span>
                          <span className="font-medium font-mono text-green-600">₹{(v.costEstimate?.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (currentProject) {
                          updateProject(currentProject.id, {
                            plotWidth: genPlotWidth,
                            plotLength: genPlotLength,
                            facing: genFacing,
                            vastu: genVastu,
                            rooms: v.rooms || [],
                            doors: v.doors || [],
                            windows: v.windows || [],
                            costEstimate: v.costEstimate || currentProject.costEstimate,
                          });
                          addToast(`Applied ${v.name || "Variant"}`, "success");
                          setGeneratedVariants([]);
                        }
                      }}
                      className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
                    >
                      Choose this plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Workspace2DPage() {
  return (
    <React.Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading workspace...</p>
        </div>
      </div>
    }>
      <Workspace2DContent />
    </React.Suspense>
  );
}
