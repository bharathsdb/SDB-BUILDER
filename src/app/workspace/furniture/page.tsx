"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Sofa, Table, Archive, Bed,
  Lightbulb, Palette, RotateCcw, Maximize2, Shrink,
  ShoppingCart, Sparkles, Search, SlidersHorizontal
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";

interface FurnitureItem {
  id: string; name: string; category: string; icon: string; width: number; height: number;
}

const furnitureCategories = [
  { id: "seating", label: "Seating", icon: Sofa },
  { id: "tables", label: "Tables", icon: Table },
  { id: "storage", label: "Storage", icon: Archive },
  { id: "beds", label: "Beds", icon: Bed },
  { id: "lighting", label: "Lighting", icon: Lightbulb },
  { id: "decor", label: "Decor", icon: Palette },
];

const allFurniture: Record<string, FurnitureItem[]> = {
  seating: [
    { id: "s1", name: "Sofa", category: "Seating", icon: "🛋️", width: 60, height: 30 },
    { id: "s2", name: "Armchair", category: "Seating", icon: "🪑", width: 25, height: 25 },
    { id: "s3", name: "Ottoman", category: "Seating", icon: "📦", width: 20, height: 20 },
    { id: "s4", name: "Bench", category: "Seating", icon: "🪑", width: 40, height: 15 },
  ],
  tables: [
    { id: "t1", name: "Coffee Table", category: "Tables", icon: "🟫", width: 35, height: 20 },
    { id: "t2", name: "Dining Table", category: "Tables", icon: "🍽️", width: 50, height: 30 },
    { id: "t3", name: "Side Table", category: "Tables", icon: "🔲", width: 15, height: 15 },
    { id: "t4", name: "Desk", category: "Tables", icon: "💻", width: 40, height: 20 },
  ],
  storage: [
    { id: "st1", name: "Bookshelf", category: "Storage", icon: "📚", width: 25, height: 60 },
    { id: "st2", name: "Cabinet", category: "Storage", icon: "🗄️", width: 35, height: 30 },
    { id: "st3", name: "Chest", category: "Storage", icon: "📁", width: 30, height: 20 },
    { id: "st4", name: "Wardrobe", category: "Storage", icon: "🚪", width: 40, height: 60 },
  ],
  beds: [
    { id: "b1", name: "King Bed", category: "Beds", icon: "🛏️", width: 60, height: 70 },
    { id: "b2", name: "Queen Bed", category: "Beds", icon: "🛏️", width: 55, height: 65 },
    { id: "b3", name: "Single Bed", category: "Beds", icon: "🛌", width: 35, height: 65 },
    { id: "b4", name: "Bunk Bed", category: "Beds", icon: "🛌", width: 40, height: 70 },
  ],
  lighting: [
    { id: "l1", name: "Floor Lamp", category: "Lighting", icon: "💡", width: 12, height: 12 },
    { id: "l2", name: "Chandelier", category: "Lighting", icon: "✨", width: 25, height: 25 },
    { id: "l3", name: "Pendant", category: "Lighting", icon: "🔆", width: 15, height: 15 },
    { id: "l4", name: "Table Lamp", category: "Lighting", icon: "🪔", width: 10, height: 10 },
  ],
  decor: [
    { id: "d1", name: "Vase", category: "Decor", icon: "🏺", width: 8, height: 8 },
    { id: "d2", name: "Plant", category: "Decor", icon: "🌿", width: 15, height: 15 },
    { id: "d3", name: "Rug", category: "Decor", icon: "🔴", width: 40, height: 25 },
    { id: "d4", name: "Wall Art", category: "Decor", icon: "🖼️", width: 20, height: 15 },
  ],
};

interface PlacedItem {
  id: string; furnitureId: string; name: string; icon: string;
  x: number; y: number; rotation: number; scale: number;
}

export default function FurniturePage() {
  const { addToast } = useUIStore();
  const [activeCategory, setActiveCategory] = React.useState("seating");
  const [placedItems, setPlacedItems] = React.useState<PlacedItem[]>([]);
  const [selectedPlaced, setSelectedPlaced] = React.useState<string | null>(null);
  const [styleFilter, setStyleFilter] = React.useState("All");
  const nextId = React.useRef(0);

  const styles = ["All", "Modern", "Classic", "Scandinavian", "Industrial"];

  const handlePlaceItem = (item: FurnitureItem) => {
    const idx = nextId.current++;
    const newItem: PlacedItem = {
      id: `p${idx}`,
      furnitureId: item.id,
      name: item.name,
      icon: item.icon,
      x: 35 + ((idx * 37) % 35),
      y: 35 + ((idx * 53) % 25),
      rotation: 0,
      scale: 1,
    };
    setPlacedItems(prev => [...prev, newItem]);
    addToast(`Placed ${item.name} on plan`, "success");
  };

  const handleRotate = () => {
    if (selectedPlaced) {
      setPlacedItems(prev => prev.map(p =>
        p.id === selectedPlaced ? { ...p, rotation: p.rotation + 45 } : p
      ));
    }
  };

  const handleScale = (dir: "up" | "down") => {
    if (selectedPlaced) {
      setPlacedItems(prev => prev.map(p =>
        p.id === selectedPlaced ? { ...p, scale: Math.max(0.5, Math.min(2, p.scale + (dir === "up" ? 0.2 : -0.2))) } : p
      ));
    }
  };

  const handleAutoArrange = () => {
    setPlacedItems(prev => prev.map((p, i) => ({
      ...p,
      x: 10 + (i * 15) % 70,
      y: 10 + Math.floor((i * 15) / 70) * 20,
      rotation: 0,
    })));
    addToast("Auto-arranged furniture!", "success");
  };

  const shoppingList = placedItems.map(p => p.name);
  const categoryCounts = shoppingList.reduce<Record<string, number>>((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Furniture Placement</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAutoArrange} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> Auto Arrange
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Categories */}
        <aside className="w-56 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {furnitureCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Style Filter</h3>
            <div className="flex flex-wrap gap-1">
              {styles.map(s => (
                <button
                  key={s}
                  onClick={() => setStyleFilter(s)}
                  className={`px-2 py-1 text-[10px] rounded-full transition-colors ${
                    styleFilter === s
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Furniture Catalog / Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Item Grid */}
          <div className="h-40 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 p-3 overflow-x-auto">
            <div className="flex gap-2 h-full">
              {(allFurniture[activeCategory] || []).map(item => (
                <button
                  key={item.id}
                  onClick={() => handlePlaceItem(item)}
                  className="flex flex-col items-center justify-center gap-1 min-w-[80px] p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-medium">{item.name}</span>
                  <span className="text-[9px] text-slate-400">{item.width}&quot;x{item.height}&quot;</span>
                </button>
              ))}
            </div>
          </div>

          {/* Floor Plan Canvas */}
          <div className="flex-1 relative bg-[#e2e8f0] dark:bg-[#09090b]">
            <div className="absolute inset-0 opacity-30 dark:opacity-10" style={{
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />

            {/* Room Outline */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] border-4 border-slate-800 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80 rounded-sm">
              {/* Room Labels */}
              <div className="absolute top-0 left-0 w-[55%] h-full border-r-4 border-b-0 border-slate-800 dark:border-zinc-700">
                <span className="absolute top-2 left-2 text-[10px] text-slate-400 font-bold uppercase">Living Room</span>
              </div>
              <div className="absolute top-0 right-0 w-[45%] h-[55%] border-b-4 border-slate-800 dark:border-zinc-700">
                <span className="absolute top-2 right-2 text-[10px] text-slate-400 font-bold uppercase">Kitchen</span>
              </div>
              <div className="absolute bottom-0 right-0 w-[45%] h-[45%]">
                <span className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-bold uppercase">Dining</span>
              </div>

              {/* Placed Furniture */}
              {placedItems.map(item => {
                const isSelected = selectedPlaced === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPlaced(item.id)}
                    className={`absolute flex items-center justify-center cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{
                      left: `${item.x}%`, top: `${item.y}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                      fontSize: `${20 * item.scale}px`,
                    }}
                  >
                    <span>{item.icon}</span>
                    <span className="absolute -bottom-4 text-[8px] whitespace-nowrap text-slate-500 font-medium">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selection Controls */}
            {selectedPlaced && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-xl z-10">
                <button onClick={handleRotate} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => handleScale("down")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <Shrink className="w-4 h-4" />
                </button>
                <button onClick={() => handleScale("up")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  onClick={() => { setPlacedItems(prev => prev.filter(p => p.id !== selectedPlaced)); setSelectedPlaced(null); }}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Shopping List */}
        <aside className="w-64 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <ShoppingCart className="w-3 h-3" /> Shopping List
            </h3>
            {placedItems.length === 0 ? (
              <p className="text-xs text-slate-500">Click items from catalog to add</p>
            ) : (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {Object.entries(categoryCounts).map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span>{name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">x{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total Items</span>
              <span className="text-lg font-bold text-primary">{placedItems.length}</span>
            </div>
            {placedItems.length > 0 && (
              <button className="w-full mt-3 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                Export Shopping List
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span>{placedItems.length} items placed</span>
          <span>Category: {activeCategory}</span>
        </div>
        <div className="flex gap-4">
          <span>{selectedPlaced ? '1 selected' : 'No selection'}</span>
          <span>Snap: On</span>
        </div>
      </footer>
    </div>
  );
}
