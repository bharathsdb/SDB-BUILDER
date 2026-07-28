"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Grid3x3, Heart, ShoppingCart,
  Check, Square, Layers, PanelTop, Building2, Kanban,
  ChevronRight, Star
} from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";

interface Material {
  id: string; name: string; color: string; cost: number; category: string;
}

const categories = [
  { id: "flooring", label: "Flooring", icon: Square },
  { id: "walls", label: "Walls", icon: Layers },
  { id: "countertops", label: "Countertops", icon: PanelTop },
  { id: "cabinetry", label: "Cabinetry", icon: Kanban },
  { id: "roofing", label: "Roofing", icon: Building2 },
  { id: "exterior", label: "Exterior", icon: Grid3x3 },
];

const materialsByCategory: Record<string, Material[]> = {
  flooring: [
    { id: "f1", name: "Marble", color: "#f5f5f0", cost: 120, category: "flooring" },
    { id: "f2", name: "Hardwood", color: "#8b5e3c", cost: 90, category: "flooring" },
    { id: "f3", name: "Ceramic Tile", color: "#e8dcc8", cost: 45, category: "flooring" },
    { id: "f4", name: "Vinyl", color: "#c9b99a", cost: 25, category: "flooring" },
    { id: "f5", name: "Bamboo", color: "#d4c4a8", cost: 55, category: "flooring" },
    { id: "f6", name: "Carpet", color: "#a8b5c4", cost: 35, category: "flooring" },
  ],
  walls: [
    { id: "w1", name: "Paint", color: "#e8e8e8", cost: 15, category: "walls" },
    { id: "w2", name: "Wallpaper", color: "#d4c9b8", cost: 30, category: "walls" },
    { id: "w3", name: "Brick Veneer", color: "#a0522d", cost: 60, category: "walls" },
    { id: "w4", name: "Stone Cladding", color: "#808080", cost: 85, category: "walls" },
    { id: "w5", name: "Wood Paneling", color: "#8b7355", cost: 70, category: "walls" },
    { id: "w6", name: "Tile", color: "#b8c4d4", cost: 40, category: "walls" },
  ],
  countertops: [
    { id: "c1", name: "Granite", color: "#2d2d2d", cost: 100, category: "countertops" },
    { id: "c2", name: "Quartz", color: "#e0ddd5", cost: 110, category: "countertops" },
    { id: "c3", name: "Marble", color: "#f0ebe0", cost: 150, category: "countertops" },
    { id: "c4", name: "Butcher Block", color: "#a0522d", cost: 65, category: "countertops" },
    { id: "c5", name: "Concrete", color: "#a0a0a0", cost: 75, category: "countertops" },
    { id: "c6", name: "Laminate", color: "#d0c0a0", cost: 30, category: "countertops" },
  ],
  cabinetry: [
    { id: "ca1", name: "Shaker", color: "#f0ebe0", cost: 200, category: "cabinetry" },
    { id: "ca2", name: "Flat Panel", color: "#e0e0e0", cost: 180, category: "cabinetry" },
    { id: "ca3", name: "Inset", color: "#d0c8b8", cost: 250, category: "cabinetry" },
    { id: "ca4", name: "Glass Front", color: "#c8d0d8", cost: 220, category: "cabinetry" },
    { id: "ca5", name: "Open Shelving", color: "#b8a898", cost: 100, category: "cabinetry" },
    { id: "ca6", name: "Custom", color: "#e8d8c8", cost: 300, category: "cabinetry" },
  ],
  roofing: [
    { id: "r1", name: "Asphalt Shingles", color: "#404040", cost: 50, category: "roofing" },
    { id: "r2", name: "Metal", color: "#808080", cost: 120, category: "roofing" },
    { id: "r3", name: "Clay Tiles", color: "#8b4513", cost: 150, category: "roofing" },
    { id: "r4", name: "Slate", color: "#484848", cost: 200, category: "roofing" },
    { id: "r5", name: "Wood Shakes", color: "#6b4226", cost: 130, category: "roofing" },
    { id: "r6", name: "Green Roof", color: "#4a7c4f", cost: 180, category: "roofing" },
  ],
  exterior: [
    { id: "e1", name: "Brick", color: "#a0522d", cost: 80, category: "exterior" },
    { id: "e2", name: "Stone", color: "#808080", cost: 120, category: "exterior" },
    { id: "e3", name: "Stucco", color: "#d4c4a8", cost: 55, category: "exterior" },
    { id: "e4", name: "Wood Siding", color: "#8b7355", cost: 70, category: "exterior" },
    { id: "e5", name: "Fiber Cement", color: "#c0c0c0", cost: 65, category: "exterior" },
    { id: "e6", name: "Glass Curtain", color: "#a0c0d0", cost: 200, category: "exterior" },
  ],
};

export default function MaterialsPage() {
  const { currentProject, updateProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [activeCategory, setActiveCategory] = React.useState("flooring");
  const [selectedMaterials, setSelectedMaterials] = React.useState<string[]>([]);
  const [favorites, setFavorites] = React.useState<string[]>([]);

  const materials = materialsByCategory[activeCategory] || [];

  const toggleSelect = (id: string) => {
    setSelectedMaterials(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleApplyToProject = () => {
    if (currentProject && selectedMaterials.length > 0) {
      const selected = Object.values(materialsByCategory).flat().filter(m => selectedMaterials.includes(m.id));
      updateProject(currentProject.id, {
        materials: selected.map(m => ({ id: m.id, name: m.name, type: m.category, cost: m.cost, unit: "sqft" })),
      });
      addToast(`Applied ${selectedMaterials.length} materials to project!`, "success");
    }
  };

  const totalCost = selectedMaterials.reduce((sum, id) => {
    const mat = Object.values(materialsByCategory).flat().find(m => m.id === id);
    return sum + (mat?.cost || 0);
  }, 0);

  const maxCost = Math.max(...Object.values(materialsByCategory).flat().map(m => m.cost), 1);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/workspace" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Material Selection Center</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyToProject}
            disabled={selectedMaterials.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 rounded-lg text-xs font-medium shadow-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Apply to Project
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Category Sidebar */}
        <aside className="w-56 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0">
          <div className="p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                    <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorites */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Heart className="w-3 h-3" /> Favorites
            </h3>
            {favorites.length === 0 ? (
              <p className="text-xs text-slate-500">No favorites yet</p>
            ) : (
              <div className="space-y-1">
                {favorites.map(id => {
                  const mat = Object.values(materialsByCategory).flat().find(m => m.id === id);
                  return mat ? (
                    <div key={id} className="flex items-center gap-2 px-2 py-1 text-xs">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: mat.color }} />
                      <span>{mat.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Materials Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-lg font-bold mb-1 capitalize">{activeCategory}</h2>
          <p className="text-sm text-slate-500 mb-6">Select materials to apply to your project</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {materials.map(mat => {
              const isSelected = selectedMaterials.includes(mat.id);
              const isFav = favorites.includes(mat.id);
              return (
                <div
                  key={mat.id}
                  className={`rounded-2xl border-2 p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-zinc-900'
                  }`}
                  onClick={() => toggleSelect(mat.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700" style={{ backgroundColor: mat.color }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(mat.id); }}
                      className={`p-1 rounded-lg transition-colors ${isFav ? 'text-red-400' : 'text-slate-300 hover:text-red-400'}`}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <h4 className="font-semibold text-sm">{mat.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">${mat.cost}/sqft</p>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
                      <Check className="w-3 h-3" /> Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cost Comparison Bar Chart */}
          <div className="mt-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Cost Comparison</h3>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="space-y-2">
                {materials.map(mat => {
                  const pct = (mat.cost / maxCost) * 100;
                  return (
                    <div key={mat.id} className="flex items-center gap-3">
                      <span className="text-xs w-24 text-slate-500">{mat.name}</span>
                      <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            selectedMaterials.includes(mat.id) ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-16 text-right text-slate-500">${mat.cost}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Selection Summary */}
        <aside className="w-64 bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Selected ({selectedMaterials.length})
            </h3>
            {selectedMaterials.length === 0 ? (
              <p className="text-xs text-slate-500">Click on materials to select them</p>
            ) : (
              <div className="space-y-2">
                {selectedMaterials.map(id => {
                  const mat = Object.values(materialsByCategory).flat().find(m => m.id === id);
                  return mat ? (
                    <div key={id} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: mat.color }} />
                      <span className="flex-1">{mat.name}</span>
                      <span className="text-xs text-slate-500">${mat.cost}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold text-primary">${totalCost}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] font-mono text-slate-500 z-20">
        <div className="flex gap-4">
          <span>Category: {activeCategory}</span>
          <span>{materials.length} materials</span>
        </div>
        <div className="flex gap-4">
          <span>{favorites.length} favorites</span>
          <span>${totalCost} estimated</span>
        </div>
      </footer>
    </div>
  );
}
