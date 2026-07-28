/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Building2, FileText, ArrowRight, Layers, Ruler } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/lib/stores/project-store";
import AssetViewer from "./AssetViewer";

interface ProjectPreviewProps {
  project: Project;
}

export default function ProjectPreview({ project }: ProjectPreviewProps) {
  const [showViewer, setShowViewer] = React.useState(false);
  const [initialAssetId, setInitialAssetId] = React.useState<string | undefined>(undefined);

  const assets = project.assets || [];

  const handleOpenViewer = (assetCategory?: "blueprint" | "3d") => {
    if (assets.length === 0) return;
    
    if (assetCategory) {
      const matching = assets.find(a => a.category === assetCategory);
      if (matching) {
        setInitialAssetId(matching.id);
      } else {
        setInitialAssetId(assets[0].id);
      }
    } else {
      setInitialAssetId(assets[0].id);
    }
    
    setShowViewer(true);
  };

  const styleColors: Record<string, string> = {
    Modern: "from-blue-500/10 to-cyan-500/10 border-blue-200/50 dark:border-blue-900/30",
    Contemporary: "from-violet-500/10 to-purple-500/10 border-violet-200/50 dark:border-violet-900/30",
    Scandinavian: "from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-900/30",
    Mediterranean: "from-orange-500/10 to-amber-500/10 border-orange-200/50 dark:border-orange-900/30",
    Farmhouse: "from-amber-500/10 to-yellow-500/10 border-amber-200/50 dark:border-amber-900/30",
    Luxury: "from-pink-500/10 to-rose-500/10 border-pink-200/50 dark:border-pink-900/30",
  };

  const currentGrad = styleColors[project.style] || "from-slate-500/10 to-slate-600/10 border-slate-200/50";
  const thumbnailAsset = assets.find(a => a.category === "render") || assets.find(a => a.category === "blueprint");

  return (
    <>
      <Card className={`overflow-hidden border bg-gradient-to-br ${currentGrad} hover:shadow-xl transition-all duration-300 group`}>
        <div className="flex flex-col md:flex-row h-full">
          {/* Visual Showcase Side */}
          <div className="md:w-1/3 aspect-video md:aspect-auto min-h-[160px] bg-slate-900 flex items-center justify-center relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-slate-200/20 dark:border-slate-800/20">
            {thumbnailAsset && thumbnailAsset.category !== "3d" ? (
              <img
                src={thumbnailAsset.url}
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-center p-6 text-slate-500">
                <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-2 animate-pulse" />
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500">No Previews</span>
              </div>
            )}
            
            {/* Quick action buttons overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-lg shadow text-xs flex items-center gap-1.5"
                onClick={() => handleOpenViewer("blueprint")}
              >
                <FileText className="w-3.5 h-3.5" /> 2D Plan
              </Button>
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/95 font-semibold rounded-lg shadow text-xs flex items-center gap-1.5"
                onClick={() => handleOpenViewer("3d")}
              >
                <Building2 className="w-3.5 h-3.5" /> 3D View
              </Button>
            </div>
          </div>

          {/* Metadata details side */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-base group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
                <Badge className="capitalize text-[10px] font-bold bg-white dark:bg-zinc-800/50 shadow-sm">
                  {project.style}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {project.description || "No description provided for this architectural model."}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{project.plotLength} x {project.plotWidth} ft</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{project.floors} Floor{project.floors > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <span className="text-[10px] text-slate-400">
                Modified {new Date(project.updatedAt).toLocaleDateString()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 font-semibold text-xs text-primary group-hover:bg-primary/5 rounded-lg flex items-center gap-1"
                onClick={() => handleOpenViewer()}
              >
                Inspect Assets
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Asset lightbox modal */}
      {showViewer && assets.length > 0 && (
        <AssetViewer
          assets={assets}
          initialAssetId={initialAssetId}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}
