"use client";
import * as React from "react";
import {
  Upload, FileImage, X, Loader2, AlertCircle,
  Scan, Building2, FileText, Download,
  Home, DoorOpen, Maximize, Sparkles, Ruler, Crosshair,
  UploadCloud, Layers, Lightbulb, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar, CircularProgress } from "@/components/ui/progress-bar";
import { useUIStore } from "@/lib/stores/ui-store";
import { apiClient } from "@/lib/api-client";
import ImageViewer from "@/components/viewers/ImageViewer";
import ModelViewer from "@/components/viewers/ModelViewer";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/heic", "application/pdf"];
const MAX_SIZE = 50 * 1024 * 1024;

interface RenderResult {
  processedImage?: string;
  processedSvg?: string;
  glbBase64?: string;
  scene?: Record<string, unknown>;
  elevations?: Record<string, string>;
  rooms?: DetectedRoom[];
  walls?: DetectedRoom[];
  doors?: DetectedRoom[];
  windows?: DetectedRoom[];
  dimensions?: DetectedDimension[];
  annotations?: string[];
  confidenceScores?: Record<string, number>;
  suggestions?: string[];
  overallScore?: number;
  logs?: string[];
  stageProgress?: Record<string, number>;
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

export default function RenderingPage() {
  const { addToast } = useUIStore();

  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string>("");
  const [dragOver, setDragOver] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [stageLabel, setStageLabel] = React.useState("");
  const [result, setResult] = React.useState<RenderResult | null>(null);
  const [error, setError] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"2d" | "3d" | "analysis">("2d");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type) && !f.name.match(/\.(png|jpg|jpeg|webp|heic|pdf)$/i)) {
      return "Unsupported file type. Use PNG, JPG, WEBP, HEIC, or PDF.";
    }
    if (f.size > MAX_SIZE) {
      return "File too large. Maximum size is 50MB.";
    }
    return null;
  };

  const selectFile = (f: File) => {
    const validationError = validateFile(f);
    if (validationError) {
      addToast(validationError, "error");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : "");
    setResult(null);
    setError("");
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      selectFile(e.target.files[0]);
    }
    e.target.value = "";
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setProgress(0);
  };

  const stages = [
    "Uploading", "Enhancing Image", "Detecting Objects",
    "Reconstructing Layout", "Generating 2D Plan",
    "Building 3D Model", "Rendering", "Analyzing Results",
  ];

  const processFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");
    setResult(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8;
        const stageIdx = Math.min(Math.floor(next / 12.5), stages.length - 1);
        setStageLabel(stages[stageIdx]);
        return Math.min(next, 95);
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("image_type", "blueprint");

      const res = await apiClient("/api/cv/render-and-analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Rendering failed");

      clearInterval(progressInterval);
      setProgress(100);
      setStageLabel("Complete");
      setResult(data);
      addToast("Rendering complete!", "success");
    } catch (err: unknown) {
      clearInterval(progressInterval);
      const message = err instanceof Error ? err.message : "Rendering failed";
      setError(message);
      addToast(message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const rooms = result?.rooms ?? [];
  const walls = result?.walls ?? [];
  const doors = result?.doors ?? [];
  const windows = result?.windows ?? [];
  const dimensions = result?.dimensions ?? [];
  const annotations = result?.annotations ?? [];
  const scores = result?.confidenceScores ?? {};
  const overallScore = result?.overallScore ?? 0;
  const suggestions = result?.suggestions ?? [];

  const downloadImage = () => {
    if (result?.processedImage) {
      const a = document.createElement("a");
      a.href = result.processedImage;
      a.download = "rendered_2d_plan.png";
      a.click();
    }
  };

  const downloadGLB = () => {
    if (result?.glbBase64) {
      const a = document.createElement("a");
      a.href = `data:model/gltf-binary;base64,${result.glbBase64}`;
      a.download = "rendered_3d_model.glb";
      a.click();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">2D & 3D Rendering</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload an image to generate 2D floor plans and 3D models with AI analysis
          </p>
        </div>
        {result && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFile}>
              <Upload className="w-4 h-4" /> New Render
            </Button>
            {result.glbBase64 && (
              <Button variant="outline" onClick={downloadGLB}>
                <Download className="w-4 h-4" /> GLB
              </Button>
            )}
            {result.processedImage && (
              <Button variant="outline" onClick={downloadImage}>
                <Download className="w-4 h-4" /> PNG
              </Button>
            )}
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.heic,.pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload / Drop Zone */}
      {!file && !isProcessing && !result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
              <UploadCloud className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">Import from File Manager</p>
              <p className="text-sm text-slate-400 mt-1">
                Drop an image here or click to browse
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, WEBP, HEIC, PDF &mdash; Up to 50MB
              </p>
            </div>
            <Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
              <FolderOpen className="w-4 h-4" /> Browse Files
            </Button>
          </div>
        </div>
      )}

      {/* Selected File Card */}
      {file && !isProcessing && !result && !error && (
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <FileImage className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <Button onClick={processFile}>
              <Scan className="w-4 h-4" /> Render & Analyze
            </Button>
            <Button variant="ghost" onClick={clearFile}>
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !isProcessing && (
        <Card className="border-danger/50 bg-danger/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Rendering Failed</p>
              <p className="text-xs text-slate-500">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={clearFile}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="w-full max-w-md">
                <ProgressBar value={progress} size="md" color="primary" />
                <p className="text-sm font-semibold mt-2">{stageLabel}</p>
                <p className="text-xs text-slate-400">{Math.round(progress)}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !isProcessing && (
        <>
          {/* Score Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "Room Detection", value: scores.roomDetection ?? scores.rooms ?? overallScore },
              { label: "Wall Detection", value: scores.wallDetection ?? scores.walls ?? overallScore },
              { label: "Door Detection", value: scores.doorDetection ?? scores.doors ?? overallScore },
              { label: "Window Detection", value: scores.windowDetection ?? scores.windows ?? overallScore },
              { label: "Layout", value: scores.layoutCoherence ?? overallScore },
              { label: "Overall", value: overallScore },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 text-center">
                  <CircularProgress value={s.value} size={60} strokeWidth={5}
                    label={s.label} sublabel={`${Math.round(s.value)}%`} />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit flex-wrap">
            {[
              { id: "2d" as const, label: "2D Floor Plan", icon: FileText },
              { id: "3d" as const, label: "3D Model", icon: Building2 },
              { id: "analysis" as const, label: "Analysis", icon: Sparkles },
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
                </button>
              );
            })}
          </div>

          {/* 2D View */}
          {activeTab === "2d" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-lg font-semibold">Generated 2D Floor Plan</h2>
                  {result.processedImage && (
                    <Button size="sm" variant="outline" onClick={downloadImage}>
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[450px]">
                    {result.processedImage ? (
                      <ImageViewer url={result.processedImage} name="rendered_2d_plan.png" />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400">
                        <div className="text-center">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">2D plan preview not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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

                <Card>
                  <CardHeader><h2 className="text-lg font-semibold">Detected Features</h2></CardHeader>
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
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 3D View */}
          {activeTab === "3d" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="text-lg font-semibold">Interactive 3D Model</h2>
                  {result.glbBase64 && (
                    <Button size="sm" variant="outline" onClick={downloadGLB}>
                      <Download className="w-3.5 h-3.5" /> GLB
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-[450px]">
                    {result.glbBase64 ? (
                      <ModelViewer
                        url={`data:model/gltf-binary;base64,${result.glbBase64}`}
                        name="rendered_3d_model.glb"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-slate-900 text-slate-400">
                        <div className="text-center">
                          <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">3D model not available</p>
                          <p className="text-xs text-slate-500 mt-1">Try uploading a blueprint or house image</p>
                        </div>
                      </div>
                    )}
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
                    </div>
                  </CardContent>
                </Card>

                {/* Elevations */}
                {result.elevations && Object.keys(result.elevations).length > 0 && (
                  <Card>
                    <CardHeader><h2 className="text-lg font-semibold">Elevations</h2></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(result.elevations).map(([key, val]) => (
                          <div key={key} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                            <img src={val} alt={key} className="w-full h-28 object-cover" />
                            <p className="text-xs text-center font-medium py-1 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === "analysis" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-lg font-semibold">AI Analysis Results</h2>
                    <Badge variant="info">{overallScore}% overall</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Confidence Scores */}
                      {Object.keys(scores).length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" /> Confidence Scores
                          </h3>
                          <div className="space-y-2">
                            {Object.entries(scores).map(([key, val]) => (
                              <div key={key} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                                <span className="font-mono font-bold">{Math.round(val)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dimensions */}
                      {dimensions.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
                            <Ruler className="w-3.5 h-3.5" /> Dimensions ({dimensions.length})
                          </h3>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {dimensions.slice(0, 15).map((d: DetectedDimension, i: number) => (
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
                        <div>
                          <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
                            <Crosshair className="w-3.5 h-3.5" /> Detected Labels ({annotations.length})
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {annotations.map((a, i) => (
                              <Badge key={i} variant="default">{a}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {result.logs && result.logs.length > 0 && (
                  <Card>
                    <CardHeader><h2 className="text-lg font-semibold">Processing Logs</h2></CardHeader>
                    <CardContent>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {result.logs.map((log, i) => (
                          <p key={i} className="text-xs font-mono text-slate-500">{log}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-lg font-semibold">Detected Elements</h2>
                    <Badge variant="info">{rooms.length} rooms</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
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

                    {rooms.length > 0 && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {rooms.map((room: DetectedRoom, i: number) => (
                          <div key={room.id || i}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: room.color || "#e2e8f0" }} />
                              <span className="font-medium">{room.name || room.type || `Room ${i + 1}`}</span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">{room.area_sqft ?? "—"} sqft</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <h2 className="text-lg font-semibold">AI Suggestions</h2>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {result.processedImage && (
                    <Button variant="outline" onClick={downloadImage}>
                      <Download className="w-4 h-4" /> Export 2D Plan
                    </Button>
                  )}
                  {result.glbBase64 && (
                    <Button variant="outline" onClick={downloadGLB}>
                      <Download className="w-4 h-4" /> Export 3D Model
                    </Button>
                  )}
                  <Button variant="outline" onClick={clearFile}>
                    <Upload className="w-4 h-4" /> Render Another
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
