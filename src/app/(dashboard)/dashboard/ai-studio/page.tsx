"use client";

import * as React from "react";
import { 
  Sparkles, Download, ArrowRight, Wand2, RefreshCcw, 
  Image as ImageIcon, Box, Layout, Clock, History, Loader2,
  CheckCircle2, FileText, Layers, Grip, Zap, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useUIStore } from "@/lib/stores/ui-store";
import { apiClient } from "@/lib/api-client";
import ImageViewer from "@/components/viewers/ImageViewer";
import ModelViewer from "@/components/viewers/ModelViewer";
import { Switch } from "@/components/ui/switch";

interface AIResult {
  success: boolean;
  pngBase64?: string;
  svgBase64?: string;
  glbBase64?: string;
  scene?: any;
  elevations?: Record<string, string>;
  rooms?: any[];
  params?: any;
  history_id?: string;
}

export default function AIStudioPage() {
  const { addToast } = useUIStore();
  
  // Design Parameters State
  const [vastuCompliant, setVastuCompliant] = React.useState(true);
  const [spaceOptimization, setSpaceOptimization] = React.useState(true);
  const [naturalLight, setNaturalLight] = React.useState(true);
  const [parkingSpace, setParkingSpace] = React.useState(true);
  const [stylePreference, setStylePreference] = React.useState<"Standard" | "Compact" | "Luxury">("Luxury");
  
  const [activeTab, setActiveTab] = React.useState<"2D Plan" | "3D Model">("2D Plan");
  
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [stage, setStage] = React.useState("");
  const [result, setResult] = React.useState<AIResult | null>(null);

  const stages = [
    "Analyzing parameters...",
    "Understanding architectural style...",
    "Optimizing space & vastu...",
    "Generating 2D floor plan...",
    "Building 3D meshes...",
    "Finalizing output..."
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsGenerating(true);
    setResult(null);
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 5;
        const stageIdx = Math.min(Math.floor(next / 15), stages.length - 1);
        setStage(stages[stageIdx]);
        return Math.min(next, 95);
      });
    }, 400);

    try {
      const prompt = `A ${stylePreference.toLowerCase()} floor plan with ${vastuCompliant ? "vastu compliance" : "standard layout"}, ${spaceOptimization ? "space optimization" : "standard spacing"}, ${naturalLight ? "natural light priority" : "standard lighting"}, and ${parkingSpace ? "parking space" : "no parking space"}.`;
      
      const res = await apiClient("/api/ai-studio/generate", {
        method: "POST",
        body: JSON.stringify({ prompt, output_type: "both" })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Generation failed");
      
      clearInterval(progressInterval);
      setProgress(100);
      setStage("Complete!");
      setResult(data);
      if (data.pngBase64) setActiveTab("2D Plan");
      addToast("Generation successful!", "success");
      
    } catch (err: any) {
      clearInterval(progressInterval);
      addToast(err.message || "Generation failed", "error");
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const downloadFile = (base64Data: string, filename: string) => {
    const a = document.createElement("a");
    a.href = base64Data;
    a.download = filename;
    a.click();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Design Parameters */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 flex flex-col overflow-y-auto z-10 shrink-0">
        <div className="p-6">
          <h2 className="text-sm font-bold tracking-widest text-slate-900 dark:text-white uppercase mb-1">DESIGN PARAMETERS</h2>
          <p className="text-sm text-slate-500 mb-8">Configure your plot and preferences</p>

          <div className="space-y-6">
            {/* Preferences */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase">
                <Settings className="w-3.5 h-3.5" /> PREFERENCES
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-orange-500">🧭</span> Vastu compliance
                  </div>
                  <Switch checked={vastuCompliant} onCheckedChange={setVastuCompliant} />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-blue-500">📐</span> Space optimization
                  </div>
                  <Switch checked={spaceOptimization} onCheckedChange={setSpaceOptimization} />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-yellow-500">☀️</span> Natural light priority
                  </div>
                  <Switch checked={naturalLight} onCheckedChange={setNaturalLight} />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-blue-400">🅿️</span> Parking space
                  </div>
                  <Switch checked={parkingSpace} onCheckedChange={setParkingSpace} />
                </div>
              </div>
            </div>

            {/* Style Preference */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-400 uppercase">
                <Sparkles className="w-3.5 h-3.5" /> STYLE PREFERENCE
              </div>
              <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                {(["Standard", "Compact", "Luxury"] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setStylePreference(style)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                      stylePreference === style 
                        ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700" 
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="mt-auto p-6 space-y-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className={`w-full h-12 rounded-xl font-bold text-lg shadow-xl transition-all ${
              isGenerating ? "bg-primary glow-primary" : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-primary dark:hover:bg-primary/90"
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2 text-orange-400 fill-orange-400" />
                Generate Floor Plan
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="animate-fade-in">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-primary truncate">{stage}</span>
                <span className="text-slate-500">{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={progress} size="sm" color="primary" className="glow-primary" />
            </div>
          )}

          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-slate-600">
              Free plan: <span className="font-bold text-slate-900 dark:text-white">4 designs remaining</span>
            </p>
            <button className="text-xs font-medium text-orange-500 hover:text-orange-600 flex items-center justify-center w-full gap-1">
              Upgrade to Pro for unlimited <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col bg-slate-100/50 dark:bg-zinc-950 relative overflow-hidden">
        
        {/* Top Action Bar */}
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab("2D Plan")}
              className={`text-sm font-bold px-2 py-4 border-b-2 transition-all ${
                activeTab === "2D Plan" ? "border-slate-900 text-slate-900 dark:border-white dark:text-white" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              2D Plan
            </button>
            <button 
              onClick={() => setActiveTab("3D Model")}
              className={`text-sm font-bold px-2 py-4 border-b-2 transition-all ${
                activeTab === "3D Model" ? "border-slate-900 text-slate-900 dark:border-white dark:text-white" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              3D Model
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-white dark:bg-zinc-900 hidden sm:flex">
              <Grip className="w-4 h-4 mr-2 text-slate-400" /> Fit
            </Button>
            <Button variant="outline" size="sm" className="bg-white dark:bg-zinc-900 hidden sm:flex">
              <RefreshCcw className="w-4 h-4 mr-2 text-slate-400" /> Rotate
            </Button>
            {result?.pngBase64 && (
              <Button size="sm" className="bg-[#D35400] hover:bg-[#D35400]/90 text-white border-0 shadow-md">
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Button>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative p-8 flex items-center justify-center overflow-auto">
          {!result && !isGenerating && (
            <div className="text-center text-slate-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Configure parameters and click Generate</p>
            </div>
          )}

          {result && activeTab === "2D Plan" && result.pngBase64 && (
            <div className="relative max-w-4xl w-full aspect-video bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-800">
              <ImageViewer url={result.pngBase64} name="plan.png" />
            </div>
          )}

          {result && activeTab === "3D Model" && result.glbBase64 && (
            <div className="relative max-w-4xl w-full aspect-video bg-white dark:bg-zinc-900 rounded-xl shadow-xl overflow-hidden animate-fade-in border border-slate-200 dark:border-slate-800">
              <ModelViewer url={`data:model/gltf-binary;base64,${result.glbBase64}`} name="model.glb" />
            </div>
          )}
        </div>

        {/* Bottom Property Overlay (Only show if we have a result) */}
        {result && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 pointer-events-none">
            {/* Chips */}
            <div className="flex gap-2 mb-2 pointer-events-auto">
              {spaceOptimization && <Badge variant="secondary" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1 shadow-lg">Space Optimized</Badge>}
              {vastuCompliant && <Badge variant="secondary" className="bg-white dark:bg-zinc-900 px-3 py-1 shadow-lg border-slate-200">Vastu Compliant</Badge>}
              <Badge variant="secondary" className="bg-white dark:bg-zinc-900 px-3 py-1 shadow-lg border-slate-200">{stylePreference}</Badge>
            </div>

            {/* Stats Bar */}
            <div className="bg-[#FAF9F6] dark:bg-zinc-900/90 backdrop-blur-md px-6 py-3 rounded-xl border border-[#EBE8E0] dark:border-zinc-800 shadow-xl flex items-center gap-6 pointer-events-auto text-sm text-[#7D7B75] dark:text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-xl">📐</span> Plot: 40x25 ft
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span> 2 BHK
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⬆️</span> North facing
              </div>
              {vastuCompliant && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                  <CheckCircle2 className="w-4 h-4" /> Vastu compliant
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
