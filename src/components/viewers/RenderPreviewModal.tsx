"use client";

import * as React from "react";
import { X, RefreshCw, AlertCircle, Image as ImageIcon, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateFloorPlanRenders, RoomLayout } from "@/lib/api/openai-render";
import { FloorPlanOverlay } from "./FloorPlanOverlay";

interface RenderPreviewModalProps {
  roomLayoutData: RoomLayout[];
  onClose: () => void;
  open?: boolean;
}

export default function RenderPreviewModal({ roomLayoutData, onClose, open = true }: RenderPreviewModalProps) {
  const [activeTab, setActiveTab] = React.useState<"2d" | "3d">("2d");
  
  const [loading2D, setLoading2D] = React.useState(false);
  const [loading3D, setLoading3D] = React.useState(false);
  
  const [prompt2D, setPrompt2D] = React.useState<string | null>(null);
  const [prompt3D, setPrompt3D] = React.useState<string | null>(null);
  
  const [error2D, setError2D] = React.useState<string | null>(null);
  const [error3D, setError3D] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading2D(true);
    setLoading3D(true);
    setError2D(null);
    setError3D(null);
    
    // We run the generate function which does both concurrently
    const res = await generateFloorPlanRenders(roomLayoutData, "");
    
    if (res.plan2D.status === "success") {
      setPrompt2D((res.plan2D as any).prompt || "");
    } else {
      setError2D((res.plan2D as any).error ?? "Failed to generate 2D plan");
    }
    setLoading2D(false);
    
    if (res.render3D.status === "success") {
      setPrompt3D((res.render3D as any).prompt || "");
    } else {
      setError3D((res.render3D as any).error ?? "Failed to generate 3D render");
    }
    setLoading3D(false);
  };

  const handleRetry2D = async () => {
    setLoading2D(true);
    setError2D(null);
    const res = await generateFloorPlanRenders(roomLayoutData, "");
    if (res.plan2D.status === "success") {
      setPrompt2D((res.plan2D as any).prompt || "");
    } else {
      setError2D((res.plan2D as any).error ?? "Failed to generate 2D plan");
    }
    setLoading2D(false);
  };

  const handleRetry3D = async () => {
    setLoading3D(true);
    setError3D(null);
    const res = await generateFloorPlanRenders(roomLayoutData, "");
    if (res.render3D.status === "success") {
      setPrompt3D((res.render3D as any).prompt || "");
    } else {
      setError3D((res.render3D as any).error ?? "Failed to generate 3D render");
    }
    setLoading3D(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4" data-testid="preview-modal">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-full shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Floor Plan Renders</h2>
            <p className="text-xs text-slate-400">Powered by DALL-E 3</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button onClick={handleGenerate} disabled={loading2D && loading3D} size="sm">
              Generate Prompts
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-slate-800 px-4 bg-slate-900">
          <button 
            data-testid="preview-2d-tab"
            onClick={() => setActiveTab("2d")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "2d" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> 2D Plan
          </button>
          <button 
            data-testid="preview-3d-tab"
            onClick={() => setActiveTab("3d")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "3d" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" /> 3D Render
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-950/20 min-h-[300px] md:min-h-[500px] flex flex-col items-center justify-center">
          
          {/* 2D Tab Content */}
          {activeTab === "2d" && (
            <div className="w-full flex flex-col items-center justify-center h-full">
              {loading2D ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Generating 2D Floor Plan...</p>
                </div>
              ) : error2D ? (
                <div className="flex flex-col items-center text-center max-w-md gap-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div>
                    <h3 className="text-red-400 font-semibold mb-1">Generation Failed</h3>
                    <p className="text-sm text-slate-400">{error2D}</p>
                  </div>
                  <Button data-testid="preview-retry-button" variant="outline" onClick={handleRetry2D} className="mt-2">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry 2D
                  </Button>
                </div>
              ) : prompt2D ? (
                <div className="w-full max-w-3xl text-left h-full flex flex-col pt-4">
                  <h3 className="font-semibold text-white mb-2">2D Floor Plan Prompt:</h3>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-sm font-mono whitespace-pre-wrap select-all flex-1 overflow-auto">
                    {prompt2D}
                  </div>
                  <p className="text-xs text-slate-500 mt-4 text-center">Copy this prompt and run it in an image generation tool (like Midjourney or DALL-E 3) to generate your floor plan.</p>
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center gap-2">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                  <p>Click Generate to create a 2D floor plan prompt based on the layout data.</p>
                </div>
              )}
            </div>
          )}

          {/* 3D Tab Content */}
          {activeTab === "3d" && (
            <div className="w-full flex flex-col items-center justify-center h-full">
              {loading3D ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Generating 3D Isometric Prompt...</p>
                </div>
              ) : error3D ? (
                <div className="flex flex-col items-center text-center max-w-md gap-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div>
                    <h3 className="text-red-400 font-semibold mb-1">Generation Failed</h3>
                    <p className="text-sm text-slate-400">{error3D}</p>
                  </div>
                  <Button data-testid="preview-retry-button" variant="outline" onClick={handleRetry3D} className="mt-2">
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry 3D
                  </Button>
                </div>
              ) : prompt3D ? (
                <div className="w-full max-w-3xl text-left h-full flex flex-col pt-4">
                  <h3 className="font-semibold text-white mb-2">3D Isometric Prompt:</h3>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-sm font-mono whitespace-pre-wrap select-all flex-1 overflow-auto">
                    {prompt3D}
                  </div>
                  <p className="text-xs text-slate-500 mt-4 text-center">Copy this prompt and run it in an image generation tool (like Midjourney or DALL-E 3) to generate your 3D cutaway render.</p>
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center gap-2">
                  <Building2 className="w-12 h-12 opacity-20" />
                  <p>Click Generate to create a 3D isometric cutaway prompt.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
