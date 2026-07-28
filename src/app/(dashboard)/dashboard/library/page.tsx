"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Library, Search, Building2, Home, Plus,
  ExternalLink, Image, Scan, FileImage, Trash2,
  Eye, Calendar, Grid3X3, List, GalleryHorizontalEnd,
  Upload, Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { mockTemplates } from "@/lib/api/mock-db";
import { useProjectStore } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";

interface MediaAssetItem {
  id: string;
  file_path: string;
  file_type: string;
  file_size: number;
  width: number;
  height: number;
  mime_type: string;
  tags: Record<string, string> | null;
  created_at: string;
}

const sizeSeeds = mockTemplates.map(() => Math.floor(Math.random() * 2000 + 800));

const categories = [
  { id: "all", label: "All", icon: GalleryHorizontalEnd },
  { id: "uploads", label: "My Uploads", icon: Upload },
  { id: "blueprints", label: "Blueprints", icon: Scan },
  { id: "plans", label: "Floor Plans", icon: FileImage },
  { id: "templates", label: "Templates", icon: Library },
];

export default function LibraryPage() {
  const router = useRouter();
  const { createProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [mediaAssets, setMediaAssets] = React.useState<MediaAssetItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = React.useState(false);
  const [view, setView] = React.useState<"grid" | "list">("grid");

  const floorPlanLibrary = React.useMemo(() =>
    mockTemplates.map((t, i) => ({
      ...t,
      category: t.category === "Premium" ? "Residential" : t.category,
      size: `${sizeSeeds[i]} sqft`,
    })), []);

  React.useEffect(() => {
    if (activeCategory !== "uploads" && activeCategory !== "blueprints" && activeCategory !== "all") return;
    let cancelled = false;
    (async () => {
      setIsLoadingMedia(true);
      try {
        const res = await apiClient("/api/cv/project/all/media");
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.assets) setMediaAssets(data.assets);
        }
      } catch {
        if (!cancelled) setMediaAssets([]);
      } finally {
        if (!cancelled) setIsLoadingMedia(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeCategory]);

  const categorized = React.useMemo(() => {
    if (activeCategory === "templates") return floorPlanLibrary;
    if (activeCategory === "plans") return [];

    let filtered = mediaAssets;
    if (activeCategory === "blueprints") {
      filtered = filtered.filter(a => a.tags?.image_type === "blueprint");
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        a.tags?.original_name?.toLowerCase().includes(q) ||
        a.tags?.image_type?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activeCategory, mediaAssets, search, floorPlanLibrary]);

  const templateFiltered = React.useMemo(() => {
    if (activeCategory !== "templates" && activeCategory !== "all") return [];
    if (activeCategory === "templates") return floorPlanLibrary;
    return [];
  }, [activeCategory, floorPlanLibrary]);

  const handleAddToProjects = async (item: typeof floorPlanLibrary[0]) => {
    await createProject({
      name: item.name,
      description: item.description,
      floors: item.floors,
      style: item.style,
    });
    addToast(`"${item.name}" added to projects`, "success");
  };

  const handleAnalyzeAsset = (asset: MediaAssetItem) => {
    const imageType = asset.tags?.image_type || "blueprint";
    router.push(
      `/dashboard/process?imageType=${imageType}&filePath=${encodeURIComponent(asset.file_path)}&assetId=${asset.id}`
    );
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await apiClient(`/api/cv/media/${assetId}`, { method: "DELETE" });
      setMediaAssets(prev => prev.filter(a => a.id !== assetId));
      addToast("Asset deleted", "success");
    } catch {
      addToast("Failed to delete asset", "error");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="w-6 h-6 text-primary" />
            Media Gallery & Library
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse your uploaded images, generated plans, and template library
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/upload")}>
            <Upload className="w-4 h-4" /> Upload
          </Button>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-slate-400"}`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-slate-400"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search images, plans, templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-transparent text-slate-500 hover:text-foreground border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoadingMedia && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* My Uploads Section */}
      {(activeCategory === "uploads" || activeCategory === "blueprints" || activeCategory === "all") && (
        <>
          {categorized.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                {activeCategory === "uploads" ? "My Uploaded Images" : "Uploaded Blueprints & Images"}
                <span className="text-sm font-normal text-slate-400 ml-2">({categorized.length})</span>
              </h2>
              {view === "grid" ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categorized.map((item) => {
                    const asset = item as MediaAssetItem;
                    return (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900"
                    >
                      <div className="aspect-[4/3] bg-slate-100 dark:bg-zinc-800 relative overflow-hidden">
                        {asset.file_path ? (
                          <img
                            src={asset.file_path}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).parentElement!.classList.add("flex", "items-center", "justify-center");
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {/* eslint-disable-next-line jsx-a11y/alt-text */}
                            <Image className="w-10 h-10 text-slate-300" aria-hidden />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button size="sm" className="flex-1 text-xs" onClick={() => handleAnalyzeAsset(asset)}>
                              <Scan className="w-3 h-3" /> Analyze
                            </Button>
                            <Button size="sm" variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs"
                              onClick={() => window.open(asset.file_path, "_blank")}>
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">
                              {asset.tags?.original_name || `Asset ${asset.id.slice(0, 8)}`}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="info" className="text-[10px]">
                                {asset.tags?.image_type || "image"}
                              </Badge>
                              {asset.width && asset.height && (
                                <span className="text-[10px] text-slate-400">
                                  {asset.width}x{asset.height}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            className="p-1 text-slate-400 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : "N/A"}
                          <span className="ml-auto">
                            {asset.file_size ? `${(asset.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  {categorized.map((item) => {
                    const asset = item as MediaAssetItem;
                    return (
                    <div key={asset.id} className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0">
                        {asset.file_path ? (
                          <img src={asset.file_path} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">{/* eslint-disable-next-line jsx-a11y/alt-text */}<Image className="w-5 h-5 text-slate-300" aria-hidden /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{asset.tags?.original_name || `Asset ${asset.id.slice(0, 8)}`}</p>
                        <p className="text-xs text-slate-400">{asset.tags?.image_type} &middot; {asset.width}x{asset.height} &middot; {asset.created_at ? new Date(asset.created_at).toLocaleDateString() : ""}</p>
                      </div>
                      <Button size="sm" onClick={() => handleAnalyzeAsset(asset)}>
                        <Scan className="w-3 h-3" /> Analyze
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(asset.file_path, "_blank")}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {categorized.length === 0 && !isLoadingMedia && (
            <div className="text-center py-12">
              <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">No uploaded images yet</h3>
              <p className="text-slate-500 text-sm mb-4">Upload images to analyze and generate floor plans</p>
              <Button onClick={() => router.push("/dashboard/upload")}>
                <Upload className="w-4 h-4" /> Go to Upload Center
              </Button>
            </div>
          )}
        </>
      )}

      {/* Template Section */}
      {(activeCategory === "templates" || activeCategory === "all") && (
        <>
          {templateFiltered.length > 0 && (
            <div className={activeCategory === "all" ? "mt-8" : ""}>
              {activeCategory === "all" && (
                <h2 className="text-lg font-semibold mb-4">
                  Floor Plan Templates
                  <span className="text-sm font-normal text-slate-400 ml-2">({templateFiltered.length})</span>
                </h2>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {templateFiltered.map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.id}
                  >
                    <Card className="group h-full flex flex-col">
                      <div className="aspect-video w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-slate-400 dark:text-slate-600" />
                      </div>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge>{item.style}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{item.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                          <span className="flex items-center gap-1"><Home className="w-3 h-3" />{item.rooms} rooms</span>
                          <span>{item.size}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-auto">
                          <Button variant="outline" size="sm" className="flex-1">
                            <ExternalLink className="w-3.5 h-3.5" /> Preview
                          </Button>
                          <Button size="sm" className="flex-1" onClick={() => handleAddToProjects(item)}>
                            <Plus className="w-3.5 h-3.5" /> Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State for Templates */}
      {activeCategory === "templates" && templateFiltered.length === 0 && (
        <div className="text-center py-12">
          <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No templates found</h3>
          <p className="text-slate-500 text-sm">
            {search ? "Try a different search term." : ""}
          </p>
        </div>
      )}
    </div>
  );
}
