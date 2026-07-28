/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  FileText, Image as ImageIcon, Building2, UploadCloud, Eye, Download,
  Trash2, Edit3, Share2, Search, Check, X, FileUp
} from "lucide-react";
import { useProjectStore, ProjectAsset } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AssetViewer from "./AssetViewer";

interface GalleryViewerProps {
  projectId: string;
}

export default function GalleryViewer({ projectId }: GalleryViewerProps) {
  const { projects, addProjectAsset, renameProjectAsset, deleteProjectAsset } = useProjectStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = React.useState<"all" | "blueprint" | "render" | "elevation" | "3d">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [previewAssetId, setPreviewAssetId] = React.useState<string | null>(null);
  
  // Rename states
  const [renamingAssetId, setRenamingAssetId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");

  const project = projects.find(p => p.id === projectId);
  const assets = React.useMemo(() => project?.assets || [], [project]);

  // Filtered Assets
  const filteredAssets = React.useMemo(() => {
    let list = [...assets];
    if (activeTab !== "all") {
      list = list.filter(a => a.category === activeTab);
    }
    if (searchQuery) {
      list = list.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [assets, activeTab, searchQuery]);

  // Upload handlers
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      const sizeStr = (file.size / 1024 / 1024).toFixed(1) + " MB";
      
      // Determine category and type
      let category: "blueprint" | "render" | "elevation" | "3d" | "asset" = "asset";
      const nameLower = file.name.toLowerCase();

      if (nameLower.endsWith(".glb") || nameLower.endsWith(".gltf") || nameLower.endsWith(".obj")) {
        category = "3d";
      } else if (nameLower.includes("blueprint") || nameLower.includes("floorplan") || nameLower.includes("plan")) {
        category = "blueprint";
      } else if (nameLower.includes("elevation") || nameLower.includes("facade")) {
        category = "elevation";
      } else if (nameLower.includes("render") || nameLower.includes("view") || nameLower.includes("interior") || nameLower.includes("exterior")) {
        category = "render";
      } else if (file.type.startsWith("image/")) {
        category = "render"; // default images to render
      }

      addProjectAsset(projectId, {
        name: file.name,
        type: file.type || (category === "3d" ? "model/gltf-binary" : "image/png"),
        url,
        category,
        size: sizeStr
      });
    }

    addToast(`Successfully uploaded ${files.length} file(s)`, "success");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Actions
  const handleRename = (assetId: string) => {
    if (!renameValue.trim()) return;
    renameProjectAsset(projectId, assetId, renameValue.trim());
    addToast("Asset renamed successfully", "success");
    setRenamingAssetId(null);
  };

  const handleDelete = (assetId: string, assetName: string) => {
    if (confirm(`Are you sure you want to delete "${assetName}"?`)) {
      deleteProjectAsset(projectId, assetId);
      addToast("Asset deleted", "info");
    }
  };

  const handleShare = (asset: ProjectAsset) => {
    if (navigator.share) {
      navigator.share({
        title: asset.name,
        url: asset.url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(asset.url).then(() => {
        addToast("Asset link copied to clipboard", "success");
      });
    }
  };

  const handleDownload = (asset: ProjectAsset) => {
    const link = document.createElement("a");
    link.href = asset.url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "blueprint": return "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
      case "render": return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
      case "elevation": return "text-amber-500 bg-amber-50 dark:bg-amber-950/20";
      case "3d": return "text-purple-500 bg-purple-50 dark:bg-purple-950/20";
      default: return "text-slate-500 bg-slate-50 dark:bg-slate-950/20";
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "blueprint": return <FileText className="w-4 h-4" />;
      case "render": return <ImageIcon className="w-4 h-4" />;
      case "elevation": return <ImageIcon className="w-4 h-4" />;
      case "3d": return <Building2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Tab filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit flex-wrap">
          {[
            { id: "all" as const, label: "All Files" },
            { id: "blueprint" as const, label: "Blueprints" },
            { id: "render" as const, label: "Renders" },
            { id: "elevation" as const, label: "Elevations" },
            { id: "3d" as const, label: "3D Models" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 bg-white dark:bg-zinc-900/50 hover:bg-slate-50/50 dark:hover:bg-zinc-900/80 transition-all rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept="image/*,.glb,.gltf,.obj"
          className="hidden"
        />
        <div className="p-4 rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors mb-3">
          <UploadCloud className="w-7 h-7" />
        </div>
        <p className="font-semibold text-sm group-hover:text-primary transition-colors">
          Upload project assets
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Drag & drop images (PNG, JPG, WEBP, SVG) or 3D models (GLB, GLTF, OBJ) here, or browse local files.
        </p>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <FileUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-base mb-1">No assets found</h3>
          <p className="text-sm text-slate-500">
            {searchQuery ? "No matches for your search query." : "Upload files or generate layouts to populate the gallery."}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const is3D = asset.category === "3d";
            const isRenaming = renamingAssetId === asset.id;

            return (
              <Card key={asset.id} className="overflow-hidden group hover:shadow-lg hover:border-primary/30 transition-all">
                {/* Thumbnail Header */}
                <div className="aspect-[4/3] w-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  {is3D ? (
                    <div className="text-center p-4">
                      <Building2 className="w-12 h-12 text-purple-400/50 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3D Model</span>
                    </div>
                  ) : (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0 bg-white text-slate-900 hover:bg-slate-100 rounded-lg shadow"
                      onClick={() => setPreviewAssetId(asset.id)}
                      title="Inspect / Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 bg-black/40 border-white/10 text-white hover:bg-black/60 rounded-lg"
                      onClick={() => handleDownload(asset)}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 bg-black/40 border-white/10 text-white hover:bg-black/60 rounded-lg"
                      onClick={() => {
                        setRenamingAssetId(asset.id);
                        setRenameValue(asset.name);
                      }}
                      title="Rename"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 bg-black/40 border-white/10 text-white hover:bg-black/60 rounded-lg"
                      onClick={() => handleShare(asset)}
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg"
                      onClick={() => handleDelete(asset.id, asset.name)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Body Details */}
                <CardContent className="p-3">
                  {isRenaming ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded bg-transparent focus:outline-none"
                      />
                      <Button
                        size="icon"
                        className="h-6 w-6 p-0 shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded"
                        onClick={() => handleRename(asset.id)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 p-0 shrink-0 rounded"
                        onClick={() => setRenamingAssetId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-xs truncate" title={asset.name.replace(/_/g, " ")}>
                        {asset.name.replace(/_/g, " ")}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="default" className={`text-[9px] font-bold px-1.5 py-0.5 rounded gap-1 ${getCategoryColor(asset.category)}`}>
                          {getCategoryIcon(asset.category)}
                          {asset.category}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          {asset.size || "Unknown"}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Asset Lightbox Modal */}
      {previewAssetId && (
        <AssetViewer
          assets={assets}
          initialAssetId={previewAssetId}
          onClose={() => setPreviewAssetId(null)}
        />
      )}
    </div>
  );
}
