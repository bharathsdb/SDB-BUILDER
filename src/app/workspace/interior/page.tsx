"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Sofa, Shirt, Sparkles, Palette,
  Grid3x3, Upload, RefreshCw, Eye, EyeOff, Maximize2,
  ChevronRight, Search, ArmchairIcon, LampIcon, BookOpen
} from "lucide-react";
import { useAIStore } from "@/lib/stores/ai-store";
import { useUIStore } from "@/lib/stores/ui-store";

type Room = "Living Room" | "Kitchen" | "Bedroom" | "Office";
type Style = "Modern" | "Scandinavian" | "Industrial" | "Bohemian" | "Minimalist";

const furnitureCatalog: Record<string, { name: string; icon: string; category: string }[]> = {
  "Seating": [
    { name: "Sofa 3-Seater", icon: "🛋️", category: "Seating" },
    { name: "Armchair", icon: "🪑", category: "Seating" },
    { name: "Ottoman", icon: "📦", category: "Seating" },
  ],
  "Tables": [
    { name: "Coffee Table", icon: "🪑", category: "Tables" },
    { name: "Dining Table", icon: "🍽️", category: "Tables" },
    { name: "Side Table", icon: "🔲", category: "Tables" },
  ],
  "Storage": [
    { name: "Bookshelf", icon: "📚", category: "Storage" },
    { name: "Cabinet", icon: "🗄️", category: "Storage" },
    { name: "Chest Drawers", icon: "📁", category: "Storage" },
  ],
  "Beds": [
    { name: "King Bed", icon: "🛏️", category: "Beds" },
    { name: "Queen Bed", icon: "🛏️", category: "Beds" },
    { name: "Bunk Bed", icon: "🛌", category: "Beds" },
  ],
  "Lighting": [
    { name: "Floor Lamp", icon: "💡", category: "Lighting" },
    { name: "Chandelier", icon: "✨", category: "Lighting" },
    { name: "Pendant Light", icon: "🔆", category: "Lighting" },
  ],
  "Decor": [
    { name: "Vase", icon: "🏺", category: "Decor" },
    { name: "Plant", icon: "🌿", category: "Decor" },
    { name: "Rug", icon: "🔴", category: "Decor" },
  ],
};

export default function InteriorPage() {
  const { furnishRoom, isGenerating } = useAIStore();
  const { addToast } = useUIStore();
  const [selectedRoom, setSelectedRoom] = React.useState<Room>("Living Room");
  const [selectedStyle, setSelectedStyle] = React.useState<Style>("Modern");
  const [showBefore, setShowBefore] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState("Seating");
  const [placedItems, setPlacedItems] = React.useState<string[]>([]);
  const [colors, setColors] = React.useState({
    walls: "#f5f5f5", floor: "#d4a574", accent: "#2d6a4f"
  });

  const rooms: Room[] = ["Living Room", "Kitchen", "Bedroom", "Office"];
  const styles: Style[] = ["Modern", "Scandinavian", "Industrial", "Bohemian", "Minimalist"];

  const handleAutoFurnish = async () => {
    await furnishRoom(selectedRoom, selectedStyle);
    const items = Object.values(furnitureCatalog).flat().slice(0, 4 + Math.floor(Math.random() * 3));
    setPlacedItems(items.map(i => i.name));
    addToast(`Auto-furnished ${selectedRoom} with ${selectedStyle} style!`, "success");
  };

  const handlePlaceItem = (name: string) => {
    setPlacedItems(prev => [...prev, name]);
    addToast(`Placed ${name} in ${selectedRoom}`, "success");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Interior Designer</span>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
          <select
            value={selectedRoom}
            onChange={e => setSelectedRoom(e.target.value as Room)}
            className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
          >
            {rooms.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
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
            onClick={handleAutoFurnish}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? "Furnishing..." : "Auto-Furnish"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Furniture Catalog Sidebar */}
        <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Style</h3>
            <div className="flex flex-wrap gap-1.5">
              {styles.map(style => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedStyle === style
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Color Scheme</h3>
            <div className="space-y-2">
              {(["walls", "floor", "accent"] as const).map(key => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-slate-500">{key}</span>
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={e => setColors(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Catalog</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {Object.keys(furnitureCatalog).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              {furnitureCatalog[selectedCategory]?.map(item => (
                <button
                  key={item.name}
                  onClick={() => handlePlaceItem(item.name)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Room Preview */}
        <main className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-zinc-950">
          <div className={`w-[600px] h-[400px] rounded-xl shadow-2xl border-4 relative transition-all duration-500 ${
            showBefore ? 'border-slate-300' : 'border-slate-800'
          }`}
            style={{
              backgroundColor: showBefore ? '#e2e8f0' : colors.walls,
            }}
          >
            {/* Floor */}
            <div className="absolute bottom-0 left-0 right-0 h-2/5 transition-colors duration-500"
              style={{ backgroundColor: showBefore ? '#cbd5e1' : colors.floor }}
            />

            {/* Window with light */}
            <div className="absolute top-4 right-8 w-20 h-32 border-2 bg-blue-100/50 border-slate-400 rounded-sm">
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Window</div>
            </div>

            {/* Placed Furniture */}
            {placedItems.map((item, i) => {
              const positions = [
                { x: 15, y: 55 }, { x: 55, y: 60 }, { x: 30, y: 65 },
                { x: 70, y: 55 }, { x: 45, y: 70 }, { x: 10, y: 70 },
                { x: 80, y: 65 }, { x: 60, y: 75 }, { x: 25, y: 75 },
              ];
              const pos = positions[i % positions.length];
              return (
                <div
                  key={`${item}-${i}`}
                  className="absolute w-14 h-10 bg-white/80 dark:bg-zinc-800/80 border border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center shadow-md text-[9px] font-medium text-center"
                  style={{
                    left: `${pos.x}%`, top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
                    color: colors.accent
                  }}
                >
                  {item.length > 10 ? item.slice(0, 10) + '...' : item}
                </div>
              );
            })}

            {/* Center Room Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              {placedItems.length === 0 && (
                <p className="text-slate-300 dark:text-zinc-700 text-sm">Click items from catalog to place them</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span>{selectedRoom}</span>
          <span>{selectedStyle}</span>
        </div>
        <div className="flex gap-4">
          <span>{placedItems.length} items placed</span>
          <span>Grid: Snap</span>
        </div>
      </footer>
    </div>
  );
}
