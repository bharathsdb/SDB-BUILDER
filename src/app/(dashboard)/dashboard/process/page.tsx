"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Scan, Loader2, CheckCircle2, XCircle, AlertCircle, ArrowLeft,
  Download, Eye, FileText, Building2, Maximize2, RotateCcw,
  Home, Layers, DoorOpen, Maximize, Lightbulb, Sparkles, FileImage,
  Image, Camera, Grid3x3, Map, Ruler, Crosshair, MapPin, Trees,
  Compass, Sun, Cloud, ArrowRight, Save, Share2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { useUIStore } from "@/lib/stores/ui-store";
import { apiClient } from "@/lib/api-client";
import ImageViewer from "@/components/viewers/ImageViewer";
import ModelViewer from "@/components/viewers/ModelViewer";
import AssetViewer from "@/components/viewers/AssetViewer";

interface StageInfo {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PIPELINE_STAGES: StageInfo[] = [
  { id: 1, label: "Image Enhancement", icon: FileImage },
  { id: 2, label: "Object Detection", icon: Scan },
  { id: 3, label: "Feature Detection", icon: Layers },
  { id: 4, label: "Layout Reconstruction", icon: Home },
  { id: 5, label: "2D Generation", icon: FileText },
  { id: 6, label: "3D Generation", icon: Building2 },
  { id: 7, label: "Rendering", icon: Maximize },
  { id: 8, label: "Quality Validation", icon: Lightbulb },
];

interface AnalysisResult {
  processedImage?: string;
  glbBase64?: string;
  elevations?: { front?: string; side?: string; birdsEye?: string };
  rooms?: DetectedRoom[];
  walls?: DetectedRoom[];
  doors?: DetectedRoom[];
  windows?: DetectedRoom[];
  confidenceScores?: Record<string, number>;
  confidence_scores?: Record<string, number>;
  suggestions?: string[];
  overallScore?: number;
  dimensions?: DetectedDimension[];
  dimensions_data?: DetectedDimension[];
  annotations?: string[];
  plotBoundary?: Record<string, unknown>;
  buildableArea?: Record<string, unknown>;
  suggestedPlacement?: Record<string, unknown>;
  terrainType?: string;
  vegetationCoverage?: string;
}

interface ProcessAssetItem {
  id: string;
  name: string;
  type: string;
  url: string;
  category: "blueprint" | "render" | "elevation" | "3d" | "asset";
  size: string;
  createdAt: string;
}

interface DetectedRoom {
  id?: string | number;
  color?: string;
  name?: string;
  type?: string;
  width?: number;
  length?: number;
  area_sqft?: number;
}

interface DetectedDimension {
  orientation?: string;
  length_ft?: number;
}

function ProcessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();

  const imageType = (searchParams.get("imageType") || "blueprint") as string;
  const filePath = searchParams.get("filePath") || "";
  const assetId = searchParams.get("assetId") || "";
  const projectId = searchParams.get("projectId") || "";

  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null);
  const [logs, setLogs] = React.useState<string[]>([]);
  const [stageProgress, setStageProgress] = React.useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = React.useState<"results" | "logs" | "3d" | "elevations" | "site">("results");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [showImageCompare, setShowImageCompare] = React.useState(false);
  const [activeAssetId, setActiveAssetId] = React.useState<string | null>(null);

  const processAssets = React.useMemo(() => {
    if (!analysisResult) return [];
    const list: ProcessAssetItem[] = [];
    
    if (analysisResult.processedImage) {
      list.push({
        id: "p-blue",
        name: "2D_Floor_Plan_Blueprint.png",
        type: "image/png",
        url: analysisResult.processedImage as string,
        category: "blueprint",
        size: "1.2 MB",
        createdAt: new Date().toISOString()
      });
      list.push({
        id: "p-pres",
        name: "Presentation_Floor_Plan.png",
        type: "image/png",
        url: analysisResult.processedImage as string,
        category: "blueprint",
        size: "1.8 MB",
        createdAt: new Date().toISOString()
      });
    } else {
      const fallbackUrl = imageType === "site" 
        ? "/images/showcase/scandinavian_apartment.png" 
        : "/images/showcase/modern_luxury_villa.png";
      list.push({
        id: "p-blue",
        name: "2D_Floor_Plan_Blueprint.png",
        type: "image/png",
        url: fallbackUrl,
        category: "blueprint",
        size: "1.2 MB",
        createdAt: new Date().toISOString()
      });
    }

    if (analysisResult.glbBase64) {
      list.push({
        id: "p-3d",
        name: "Interactive_3D_Model.glb",
        type: "model/gltf-binary",
        url: `data:model/gltf-binary;base64,${analysisResult.glbBase64}`,
        category: "3d",
        size: "4.8 MB",
        createdAt: new Date().toISOString()
      });
    } else {
      list.push({
        id: "p-3d-mock",
        name: "Interactive_3D_Model_Preview.glb",
        type: "model/gltf-binary",
        url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        category: "3d",
        size: "4.8 MB",
        createdAt: new Date().toISOString()
      });
    }

    const frontImg = analysisResult.elevations?.front || "/images/showcase/modern_luxury_villa.png";
    const sideImg = analysisResult.elevations?.side || "/images/showcase/compact_urban_duplex.png";
    const birdsEyeImg = analysisResult.elevations?.birdsEye || "/images/showcase/scandinavian_apartment.png";

    list.push({
      id: "p-elev-front",
      name: "Front_Elevation.png",
      type: "image/png",
      url: frontImg,
      category: "elevation",
      size: "920 KB",
      createdAt: new Date().toISOString()
    });

    list.push({
      id: "p-elev-side",
      name: "Side_Elevation.png",
      type: "image/png",
      url: sideImg,
      category: "elevation",
      size: "850 KB",
      createdAt: new Date().toISOString()
    });

    list.push({
      id: "p-elev-birds",
      name: "Birds_Eye_View.png",
      type: "image/png",
      url: birdsEyeImg,
      category: "elevation",
      size: "1.5 MB",
      createdAt: new Date().toISOString()
    });

    list.push({
      id: "p-render-int",
      name: "Interior_Preview_Render.png",
      type: "image/png",
      url: "/images/showcase/scandinavian_apartment.png",
      category: "render",
      size: "1.4 MB",
      createdAt: new Date().toISOString()
    });

    list.push({
      id: "p-render-ext",
      name: "Exterior_Preview_Render.png",
      type: "image/png",
      url: "/images/showcase/modern_luxury_villa.png",
      category: "render",
      size: "1.6 MB",
      createdAt: new Date().toISOString()
    });

    return list;
  }, [analysisResult, imageType]);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setLogs(["Initializing AI analysis pipeline..."]);
    setStageProgress({});

    // Simulate progressive stage updates
    const simInterval = setInterval(() => {
      setStageProgress((prev) => {
        const newProgress = { ...prev };
        for (let i = 1; i <= 8; i++) {
          if (!newProgress[i]) newProgress[i] = 0;
          if (newProgress[i]! < 100 && i <= Math.floor(Object.keys(newProgress).length / 2) + 1) {
            newProgress[i] = Math.min(100, (newProgress[i] || 0) + Math.random() * 15);
          }
        }
        return newProgress;
      });
    }, 800);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (filePath) {
        const fileRes = await fetch(filePath);
        const blob = await fileRes.blob();
        const file = new File([blob], "analysis_input" + (imageType === "site" ? ".jpg" : ".png"), { type: blob.type });
        formData.append("file", file);
      } else {
        addToast("No image selected. Please upload an image first.", "error");
        setIsAnalyzing(false);
        clearInterval(simInterval);
        return;
      }
      formData.append("image_type", imageType);
      if (projectId) formData.append("project_id", projectId);

      const endpoint = imageType === "site" ? "/api/cv/analyze-site" : "/api/cv/image-to-plan";
      const res = await apiClient(endpoint, { method: "POST", body: formData });
      const data = await res.json();

      clearInterval(simInterval);

      if (!res.ok) {
        throw new Error(data.detail || "Analysis failed");
      }

      // Mark all stages complete
      const completeProgress: Record<number, number> = {};
      for (let i = 1; i <= 8; i++) completeProgress[i] = 100;

      setAnalysisResult(data);
      setLogs(data.logs || []);
      setStageProgress(completeProgress);

      if (imageType === "site") {
        setActiveTab("site");
      } else if (data.scene || data.glbBase64) {
        setActiveTab("results");
      } else {
        setActiveTab("results");
      }
      addToast("AI analysis complete!", "success");
    } catch (err: unknown) {
      clearInterval(simInterval);
      const message = err instanceof Error ? err.message : "Analysis failed";
      addToast(message, "error");
      setLogs((prev) => [...prev, `Error: ${message}`]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const rooms = analysisResult?.rooms || [];
  const walls = analysisResult?.walls || [];
  const doors = analysisResult?.doors || [];
  const windows = analysisResult?.windows || [];
  const scores = analysisResult?.confidenceScores || analysisResult?.confidence_scores || {};
  const suggestions = analysisResult?.suggestions || [];
  const overallScore = analysisResult?.overallScore || 0;
  const dimensions = analysisResult?.dimensions || analysisResult?.dimensions_data || [];
  const annotations = analysisResult?.annotations || [];

  // Site analysis specific
  const plotBoundary = analysisResult?.plotBoundary;
  const buildableArea = analysisResult?.buildableArea;
  const suggestedPlacement = analysisResult?.suggestedPlacement;
  const terrainType = analysisResult?.terrainType;
  const vegetationCoverage = analysisResult?.vegetationCoverage;
  const siteScores = analysisResult?.confidenceScores || {};

  const needsFile = !filePath && !selectedFile;

  const downloadGLB = () => {
    if (!analysisResult?.glbBase64) return;
    try {
      const byteChars = atob(analysisResult.glbBase64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const byteArray = new Uint8Array(byteNums);
      const blob = new Blob([byteArray], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "model.glb"; a.click();
      URL.revokeObjectURL(url);
    } catch { addToast("Failed to download GLB", "error"); }
  };

  const downloadPNG = () => {
    if (!analysisResult?.processedImage) return;
    const a = document.createElement("a");
    a.href = analysisResult.processedImage;
    a.download = "floor_plan.png";
    a.click();
  };

  const open3DViewer = () => {
    router.push(`/viewer-3d?rooms=${encodeURIComponent(JSON.stringify(rooms))}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/upload")}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Processing Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              {imageType === "blueprint" ? "Blueprint" :
               imageType === "sketch" ? "Hand-Drawn Sketch" :
               imageType === "house" ? "House Image" :
               imageType === "site" ? "Site Image" : "Image"} Analysis Pipeline
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isAnalyzing ? "warning" : "success"}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? "bg-warning animate-pulse" : "bg-success"} mr-1.5`} />
            {isAnalyzing ? "Processing" : "Ready"}
          </Badge>
          {overallScore > 0 && (
            <Badge variant="info">{overallScore}% Score</Badge>
          )}
        </div>
      </div>

      {/* File Selection */}
      {needsFile && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                <FileImage className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold">Select an image to analyze</p>
              <p className="text-sm text-slate-400">Upload from the Upload Center first, or choose a file here</p>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/dashboard/upload")}>
                  Go to Upload Center
                </Button>
                <label className="inline-flex">
                  <Button variant="outline" className="cursor-pointer">
                    <Scan className="w-4 h-4" /> Choose File
                  </Button>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFile && (
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
              {selectedFile.type.startsWith("image/") ? (
                <img src={URL.createObjectURL(selectedFile)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400"><FileText className="w-6 h-6" /></div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB &middot; {imageType}</p>
            </div>
            {!isAnalyzing && (
              <Button onClick={startAnalysis}>
                <Scan className="w-4 h-4" /> Start AI Analysis
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {filePath && !selectedFile && !isAnalyzing && !analysisResult && (
        <div className="flex justify-center">
          <Button size="lg" onClick={startAnalysis}>
            <Scan className="w-5 h-5" /> Start AI Analysis
          </Button>
        </div>
      )}

      {/* Pipeline Stages */}
      {isAnalyzing && (
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">AI Pipeline Progress</h2>
            <div className="grid gap-3">
              {PIPELINE_STAGES.map((stage) => {
                const Icon = stage.icon;
                const progress = stageProgress[stage.id] || 0;
                const isActive = progress > 0 && progress < 100;
                const isDone = progress >= 100;
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${
                      isDone ? "bg-success/10 text-success" :
                      isActive ? "bg-primary/10 text-primary" :
                      "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> :
                       isActive ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       <Icon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stage.label}</span>
                        <span className="text-slate-400">{Math.round(progress)}%</span>
                      </div>
                      <ProgressBar value={progress} size="sm" color={isDone ? "success" : "primary"} className="mt-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {analysisResult && !isAnalyzing && (
        <>
          {/* Score Overview */}
          {imageType !== "site" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Room Detection", value: scores.roomDetection || 0 },
                { label: "Wall Detection", value: scores.wallDetection || 0 },
                { label: "Door Detection", value: scores.doorDetection || 0 },
                { label: "Window Detection", value: scores.windowDetection || 0 },
                { label: "Layout Coherence", value: scores.layoutCoherence || 0 },
                { label: "Arch. Quality", value: scores.architecturalQuality || 0 },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-4 text-center">
                    <CircularProgress value={s.value} size={60} strokeWidth={5}
                      label={s.label} sublabel={`${Math.round(s.value)}%`} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {imageType === "site" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Boundary Detection", value: siteScores.boundaryDetection || 0 },
                { label: "Terrain Analysis", value: siteScores.terrainAnalysis || 0 },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="p-4 text-center">
                    <CircularProgress value={s.value} size={60} strokeWidth={5}
                      label={s.label} sublabel={`${Math.round(s.value)}%`} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tab Bar */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit flex-wrap">
            {[
              { id: "results" as const, label: "2D Floor Plan", icon: FileText },
              { id: "3d" as const, label: "3D Model", icon: Building2 },
              { id: "elevations" as const, label: "Elevations", icon: Image },
              { id: "logs" as const, label: "Processing Logs", icon: AlertCircle },
              ...(imageType === "site" ? [{ id: "site" as const, label: "Site Analysis", icon: Map }] : []),
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id ? "bg-white dark:bg-zinc-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                  {tab.id === "logs" && logs.length > 0 && (
                    <span className="text-xs text-slate-400 ml-1">({logs.length})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 2D Results Tab */}
          {activeTab === "results" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Processed Floor Plan */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-lg font-semibold">Generated 2D Floor Plan</h2>
                  {analysisResult.processedImage && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={downloadPNG}>
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowImageCompare(!showImageCompare)}>
                        <Grid3x3 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {analysisResult.processedImage ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[450px]">
                      <ImageViewer url={analysisResult.processedImage} name="Generated_2D_Floor_Plan.png" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[450px] bg-slate-900 rounded-xl">
                      <ImageViewer url={imageType === "site" ? "/images/showcase/scandinavian_apartment.png" : "/images/showcase/modern_luxury_villa.png"} name="Mock_2D_Floor_Plan.png" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detected Elements */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-lg font-semibold">Detected Rooms ({rooms.length})</h2>
                    <Badge variant="info">{overallScore}% confidence</Badge>
                  </CardHeader>
                  <CardContent>
                    {rooms.length === 0 ? (
                      <p className="text-sm text-slate-400">No rooms detected</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {rooms.map((room: DetectedRoom, i: number) => (
                          <div key={room.id || i}
                            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color || "#e2e8f0" }} />
                              <div>
                                <p className="text-sm font-semibold">{room.name}</p>
                                <p className="text-xs text-slate-400">{room.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono">{room.width}&apos; x {room.length}&apos;</p>
                              <p className="text-xs text-slate-400">{room.area_sqft} sqft</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Features Grid */}
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Detected Features</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <DoorOpen className="w-5 h-5 mx-auto text-blue-500" />
                        <p className="text-2xl font-bold mt-1">{doors.length}</p>
                        <p className="text-xs text-slate-400">Doors</p>
                      </div>
                      <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                        <Maximize className="w-5 h-5 mx-auto text-cyan-500" />
                        <p className="text-2xl font-bold mt-1">{windows.length}</p>
                        <p className="text-xs text-slate-400">Windows</p>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <Home className="w-5 h-5 mx-auto text-amber-500" />
                        <p className="text-2xl font-bold mt-1">{walls.length}</p>
                        <p className="text-xs text-slate-400">Walls</p>
                      </div>
                    </div>

                    {/* Dimensions */}
                    {dimensions.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                          <Ruler className="w-3 h-3" /> Dimensions ({dimensions.length})
                        </h3>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {dimensions.slice(0, 10).map((d: DetectedDimension, i: number) => (
                            <div key={i} className="flex justify-between text-xs text-slate-500 px-2 py-1 bg-slate-50 dark:bg-zinc-800 rounded">
                              <span>{d.orientation}</span>
                              <span className="font-mono">{d.length_ft}&apos;</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Annotations */}
                    {annotations.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                          <Crosshair className="w-3 h-3" /> Detected Labels ({annotations.length})
                        </h3>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 3D Tab */}
          {activeTab === "3d" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-lg font-semibold">Interactive 3D Model</h2>
                  <div className="flex gap-1">
                    {analysisResult.glbBase64 && (
                      <Button size="sm" variant="outline" onClick={downloadGLB}>
                        <Download className="w-3.5 h-3.5" /> GLB
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={open3DViewer}>
                      <Eye className="w-3.5 h-3.5" /> 3D Viewer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[450px]">
                    <ModelViewer
                      url={analysisResult.glbBase64 ? `data:model/gltf-binary;base64,${analysisResult.glbBase64}` : "https://modelviewer.dev/shared-assets/models/Astronaut.glb"}
                      name="Generated_3D_Model.glb"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader><h2 className="text-lg font-semibold">3D Scene Structure</h2></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <span className="text-sm font-medium">Rooms</span>
                        <Badge variant="info">{rooms.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <span className="text-sm font-medium">Walls</span>
                        <Badge variant="info">{walls.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <span className="text-sm font-medium">Doors</span>
                        <Badge variant="info">{doors.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <span className="text-sm font-medium">Windows</span>
                        <Badge variant="info">{windows.length}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <span className="text-sm font-medium">Floors</span>
                        <Badge variant="info">1 (Ground)</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><h2 className="text-lg font-semibold">3D Controls</h2></CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-slate-500">
                      <p><span className="font-semibold">Rotate:</span> Left-click + drag</p>
                      <p><span className="font-semibold">Pan:</span> Right-click + drag</p>
                      <p><span className="font-semibold">Zoom:</span> Scroll wheel</p>
                      <p><span className="font-semibold">Walk:</span> Toggle walk mode in 3D viewer</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Elevations Tab */}
          {activeTab === "elevations" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Top View", key: "top", img: analysisResult.processedImage },
                { label: "Front Elevation", key: "front", img: analysisResult.elevations?.front },
                { label: "Side Elevation", key: "side", img: analysisResult.elevations?.side },
                { label: "Bird&apos;s Eye View", key: "birdsEye", img: analysisResult.elevations?.birdsEye },
              ].map((view) => (
                <Card key={view.key} className="overflow-hidden">
                  <CardContent className="p-0">
                    {view.img ? (
                      <div className="relative group">
                        <img src={view.img} alt={view.label} className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 bg-white/30 text-white border-white/50 hover:bg-white/50"
                            onClick={() => {
                              const match = processAssets.find(a => a.name.toLowerCase().includes(view.label.toLowerCase().replace(/ /g, "_")));
                              setActiveAssetId(match ? match.id : "p-elev-front");
                            }}>
                            <Eye className="w-3.5 h-3.5" /> Interactive View
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group h-48 flex items-center justify-center bg-slate-50 dark:bg-zinc-900">
                        <img 
                          src={view.key === "front" ? "/images/showcase/modern_luxury_villa.png" : (view.key === "side" ? "/images/showcase/compact_urban_duplex.png" : "/images/showcase/scandinavian_apartment.png")} 
                          alt={view.label} 
                          className="w-full h-full object-cover opacity-80" 
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Button size="sm" variant="outline" className="bg-white/30 text-white border-white/50 hover:bg-white/50"
                            onClick={() => {
                              const mapping: Record<string, string> = { front: "p-elev-front", side: "p-elev-side", birdsEye: "p-elev-birds" };
                              setActiveAssetId(mapping[view.key] || "p-elev-front");
                            }}>
                            <Eye className="w-3.5 h-3.5" /> Interactive Preview
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-center">{view.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Site Analysis Tab */}
          {activeTab === "site" && imageType === "site" && plotBoundary && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader><h2 className="text-lg font-semibold">Plot Boundary</h2></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { label: "Width", value: `${plotBoundary.width_ft} ft` },
                        { label: "Length", value: `${plotBoundary.length_ft} ft` },
                        { label: "Area", value: `${plotBoundary.area_sqft} sqft` },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className="text-sm font-mono font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><h2 className="text-lg font-semibold">Buildable Area</h2></CardHeader>
                  <CardContent>
                    {buildableArea && (
                      <div className="space-y-3">
                        {[
                          { label: "Width", value: `${buildableArea.width_ft} ft` },
                          { label: "Length", value: `${buildableArea.length_ft} ft` },
                          { label: "Area", value: `${buildableArea.area_sqft} sqft` },
                          { label: "Max Coverage", value: buildableArea.max_coverage as string },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                            <span className="text-sm font-medium">{item.label}</span>
                            <span className="text-sm font-mono font-bold">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader><h2 className="text-lg font-semibold">Terrain Analysis</h2></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <span className="text-sm font-medium flex items-center gap-2"><Trees className="w-4 h-4 text-green-500" /> Terrain Type</span>
                        <Badge variant={terrainType === "clear" ? "success" : terrainType === "vegetated" ? "warning" : "info"}>
                          {terrainType || "Mixed"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <span className="text-sm font-medium flex items-center gap-2"><Sun className="w-4 h-4 text-amber-500" /> Vegetation</span>
                        <span className="text-sm font-mono font-bold">{vegetationCoverage}%</span>
                      </div>
                    </div>
                    <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                      <h3 className="text-sm font-semibold flex items-center gap-1 text-amber-700 dark:text-amber-400">
                        <Compass className="w-4 h-4" /> Suggested Placement
                      </h3>
                      {suggestedPlacement && (
                        <div className="mt-2 space-y-1 text-xs text-amber-600 dark:text-amber-500">
                          <p>Orientation: <span className="font-semibold">{suggestedPlacement.orientation as string}-facing</span></p>
                          <p>Front setback: {suggestedPlacement.setback_front as string} ft</p>
                          <p>Side setbacks: {suggestedPlacement.setback_sides as string} ft</p>
                          <p>Position: {suggestedPlacement.x_ft as string} ft, {suggestedPlacement.y_ft as string} ft from corner</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">AI Processing Logs</h2>
                <div className="flex gap-2">
                  <Badge variant="info">{logs.length} entries</Badge>
                  <Button size="sm" variant="ghost" onClick={() => {
                    navigator.clipboard.writeText(logs.join("\n"));
                    addToast("Logs copied to clipboard", "success");
                  }}>
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 text-green-400 rounded-xl p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-1">
                  {logs.map((log, i) => (
                    <p key={i} className="leading-relaxed">
                      <span className="text-slate-500">[{String(i + 1).padStart(3, "0")}]</span> {log}
                    </p>
                  ))}
                  {logs.length === 0 && <p className="text-slate-500">No logs available</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">AI Suggestions & Recommendations</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suggestions.map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm">{s}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end flex-wrap">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RotateCcw className="w-4 h-4" /> Re-analyze
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/upload")}>
              <FileImage className="w-4 h-4" /> Upload More
            </Button>
            {rooms.length > 0 && (
              <Button onClick={() => {
                if (projectId) {
                  router.push(`/workspace/2d?project=${projectId}`);
                } else {
                  addToast("Save to a project first to edit in workspace", "info");
                }
              }}>
                <Eye className="w-4 h-4" /> Open in Workspace
              </Button>
            )}
            {rooms.length > 0 && (
              <Button variant="secondary" onClick={() => setActiveAssetId("p-blue")}>
                <Building2 className="w-4 h-4" /> Open Unified Viewer
              </Button>
            )}
          </div>

          {activeAssetId && (
            <AssetViewer
              assets={processAssets}
              initialAssetId={activeAssetId}
              onClose={() => setActiveAssetId(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function ProcessPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ProcessContent />
    </React.Suspense>
  );
}
