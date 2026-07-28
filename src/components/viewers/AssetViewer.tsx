"use client";

import * as React from "react";
import { X, FileText, Image as ImageIcon, Building2, PanelLeftClose, PanelLeft } from "lucide-react";
import ImageViewer from "./ImageViewer";
import ModelViewer from "./ModelViewer";
import { ProjectAsset } from "@/lib/stores/project-store";
import { Button } from "@/components/ui/button";

interface AssetViewerProps {
  assets: ProjectAsset[];
  initialAssetId?: string;
  onClose: () => void;
  open?: boolean;
}

export default function AssetViewer({ assets, initialAssetId, onClose, open = true }: AssetViewerProps) {
  const [selectedAssetId, setSelectedAssetId] = React.useState<string>(() => {
    return initialAssetId || (assets && assets.length > 0 ? assets[0].id : "");
  });
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Sync state if initialAssetId prop changes
  const [prevInitialId, setPrevInitialId] = React.useState(initialAssetId);
  if (initialAssetId !== prevInitialId) {
    setSelectedAssetId(initialAssetId || (assets && assets.length > 0 ? assets[0].id : ""));
    setPrevInitialId(initialAssetId);
  }

  if (!open || !assets || assets.length === 0) return null;

  const currentAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  const is3DAsset = (asset: ProjectAsset) => {
    return (
      asset.type.includes("model") ||
      asset.url.toLowerCase().endsWith(".glb") ||
      asset.url.toLowerCase().endsWith(".gltf") ||
      asset.url.toLowerCase().endsWith(".obj")
    );
  };

  const getAssetIcon = (asset: ProjectAsset) => {
    if (is3DAsset(asset)) return <Building2 className="w-4 h-4 text-purple-400" />;
    if (asset.category === "blueprint") return <FileText className="w-4 h-4 text-blue-400" />;
    return <ImageIcon className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/95 text-white backdrop-blur-sm transition-opacity duration-300">
      
      {/* Sidebar - Professional Asset Browser */}
      {sidebarOpen && assets.length > 1 && (
        <aside className="absolute md:relative z-20 w-80 max-w-[85vw] h-full border-r border-slate-800 bg-slate-900/95 md:bg-slate-900/50 backdrop-blur-md flex flex-col shrink-0 transition-all duration-300 animate-in slide-in-from-left">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Project Files</h3>
              <p className="text-xs text-slate-500">{assets.length} assets available</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white rounded-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>

          {/* Sidebar List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Group assets by category */}
            {["blueprint", "3d", "elevation", "render", "asset"].map((cat) => {
              const catAssets = assets.filter(a => a.category === cat);
              if (catAssets.length === 0) return null;

              const displayLabel = 
                cat === "blueprint" ? "Blueprints" :
                cat === "3d" ? "3D Models" :
                cat === "elevation" ? "Elevations" :
                cat === "render" ? "Renderings" : "Other Assets";

              return (
                <div key={cat} className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                    {displayLabel}
                  </h4>
                  <div className="space-y-0.5">
                    {catAssets.map((asset) => {
                      const isActive = asset.id === selectedAssetId;
                      return (
                        <button
                          key={asset.id}
                          onClick={() => setSelectedAssetId(asset.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                          }`}
                        >
                          {getAssetIcon(asset)}
                          <div className="min-w-0 flex-1">
                            <p className="truncate">{asset.name.replace(/_/g, " ")}</p>
                            {asset.size && (
                              <p className={`text-[10px] ${isActive ? "text-white/60" : "text-slate-600"}`}>
                                {asset.size}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col min-w-0 relative">
        {/* Header toolbar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {!sidebarOpen && assets.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white rounded-lg shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="min-w-0">
              <h2 className="font-semibold text-sm truncate">
                {currentAsset.name.replace(/_/g, " ")}
              </h2>
              <p className="text-xs text-slate-500 capitalize flex items-center gap-1">
                {currentAsset.category} &bull; {is3DAsset(currentAsset) ? "Interactive 3D" : "2D Image"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Viewer Viewport */}
        <div className="flex-1 w-full bg-slate-900">
          {is3DAsset(currentAsset) ? (
            <ModelViewer
              key={currentAsset.id}
              url={currentAsset.url}
              name={currentAsset.name}
            />
          ) : (
            <ImageViewer
              key={currentAsset.id}
              url={currentAsset.url}
              name={currentAsset.name}
            />
          )}
        </div>
      </main>
    </div>
  );
}
