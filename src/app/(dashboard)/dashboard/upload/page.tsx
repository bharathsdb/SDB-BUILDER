"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Upload, Camera, Image, FileImage, X, Check, Loader2, AlertCircle,
  Scan, Building2, FileUp, Eye, Trash2, ChevronRight, Download,
  Maximize2, Minimize2, RotateCcw, Crop, GalleryHorizontalEnd, UploadCloud,
  Grid3X3, List, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useUIStore } from "@/lib/stores/ui-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { apiClient } from "@/lib/api-client";

type ImageType = "blueprint" | "sketch" | "house" | "site";

interface UploadFileItem {
  id: string;
  file: File;
  preview: string;
  imageType: ImageType;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  assetId?: string;
  filePath?: string;
}

const IMAGE_TYPES: { value: ImageType; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { value: "blueprint", label: "Blueprint", icon: Scan, desc: "Architectural blueprint or CAD drawing" },
  { value: "sketch", label: "Hand Sketch", icon: FileImage, desc: "Hand-drawn floor plan sketch" },
  { value: "house", label: "House Image", icon: Building2, desc: "Photo of a house or building" },
  { value: "site", label: "Site Image", icon: Image, desc: "Plot or land photograph" },
];

function ImageTypeSelector({ value, onChange }: { value: ImageType; onChange: (v: ImageType) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {IMAGE_TYPES.map((t) => {
        const Icon = t.icon;
        const isActive = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            <div className={`p-2.5 rounded-full ${isActive ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { projects, fetchProjects } = useProjectStore();

  const [files, setFiles] = React.useState<UploadFileItem[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const [imageType, setImageType] = React.useState<ImageType>("blueprint");
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>("");
  const [showCamera, setShowCamera] = React.useState(false);
  const [cameraStream, setCameraStream] = React.useState<MediaStream | null>(null);
  const [isUploadingAll, setIsUploadingAll] = React.useState(false);
  const [uploadView, setUploadView] = React.useState<"grid" | "list">("grid");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/heic", "application/pdf"];
  const MAX_SIZE = 50 * 1024 * 1024;

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(png|jpg|jpeg|webp|heic|pdf)$/i)) {
      return "Unsupported file type. Use PNG, JPG, WEBP, HEIC, or PDF.";
    }
    if (file.size > MAX_SIZE) {
      return "File too large. Maximum size is 50MB.";
    }
    return null;
  };

  const addFile = (file: File) => {
    const error = validateFile(file);
    const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    setFiles((prev) => [
      ...prev,
      { id, file, preview, imageType, progress: 0, status: error ? "error" : "pending", error: error ?? undefined },
    ]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer.files).forEach(addFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(addFile);
    }
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setFiles([]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      addToast("Camera access denied or not available", "error");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.png`, { type: "image/png" });
        addFile(file);
        addToast("Photo captured successfully", "success");
      }
    }, "image/png");
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const uploadFile = async (item: UploadFileItem): Promise<boolean> => {
    setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 10 } : f)));

    try {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("image_type", item.imageType);
      if (selectedProjectId) formData.append("project_id", selectedProjectId);

      const res = await apiClient("/api/cv/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "completed", progress: 100, assetId: data.asset_id, filePath: data.file_path }
            : f
        )
      );
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "error", error: message } : f))
      );
      return false;
    }
  };

  const uploadAll = async () => {
    setIsUploadingAll(true);
    const pending = files.filter((f) => f.status === "pending");
    let successCount = 0;
    for (const item of pending) {
      const ok = await uploadFile(item);
      if (ok) successCount++;
    }
    setIsUploadingAll(false);
    if (successCount > 0) {
      addToast(`${successCount} of ${pending.length} files uploaded successfully`, "success");
    } else if (pending.length > 0) {
      addToast("Upload failed. Check file types and sizes.", "error");
    }
  };

  const analyzeFile = (item: UploadFileItem) => {
    addToast(`Starting AI analysis of ${item.file.name}...`, "info");
    router.push(
      `/dashboard/process?imageType=${item.imageType}&filePath=${encodeURIComponent(item.filePath || "")}` +
      `&assetId=${item.assetId || ""}&projectId=${selectedProjectId}`
    );
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const hasCompleted = files.some((f) => f.status === "completed");
  const uploadingCount = files.filter((f) => f.status === "uploading").length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload or capture images to generate 2D floor plans and 3D models
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={startCamera} disabled={showCamera}>
            <Camera className="w-4 h-4" /> Camera
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" /> Upload Files
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.heic,.pdf"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Image Type Selector */}
      <Card>
        <CardContent>
          <h2 className="text-sm font-semibold text-slate-500 mb-3">Image Type</h2>
          <ImageTypeSelector value={imageType} onChange={setImageType} />
        </CardContent>
      </Card>

      {/* Project Select */}
      <Card>
        <CardContent className="flex items-center gap-4">
          <label className="text-sm font-semibold text-slate-500 whitespace-nowrap">Save to Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">No project (upload only)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => router.push("/generate")}>
            <FolderOpen className="w-3.5 h-3.5" /> New Project
          </Button>
        </CardContent>
      </Card>

      {/* Camera View */}
      {showCamera && (
        <Card>
          <CardContent>
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full max-h-[500px] object-contain" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 rounded-xl" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                <Button onClick={capturePhoto}>
                  <Camera className="w-4 h-4" /> Capture Photo
                </Button>
                <Button variant="danger" onClick={stopCamera}>
                  <X className="w-4 h-4" /> Close Camera
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">
              Point camera at a blueprint, sketch, house, or site photo
            </p>
          </CardContent>
        </Card>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
            <UploadCloud className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-semibold">Drag & drop files here</p>
            <p className="text-sm text-slate-400 mt-1">
              PNG, JPG, WEBP, HEIC, PDF &mdash; Up to 50MB each &mdash; Upload multiple at once
            </p>
          </div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </Button>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Files ({files.length})</h2>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setUploadView("grid")}
                    className={`p-1.5 rounded-md transition-colors ${uploadView === "grid" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-slate-400"}`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setUploadView("list")}
                    className={`p-1.5 rounded-md transition-colors ${uploadView === "list" ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-slate-400"}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                {pendingCount > 0 && (
                  <Button size="sm" onClick={uploadAll} isLoading={isUploadingAll}>
                    <Upload className="w-3.5 h-3.5" /> Upload All ({pendingCount})
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {uploadView === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group rounded-xl overflow-hidden border aspect-square transition-all ${
                      item.status === "error" ? "border-danger/50 bg-danger/5" :
                      item.status === "completed" ? "border-success/50 bg-success/5" :
                      "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {item.preview ? (
                      <img src={item.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-zinc-800">
                        <FileImage className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate font-medium">{item.file.name}</p>
                    </div>
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge variant={
                        item.status === "completed" ? "success" :
                        item.status === "error" ? "danger" :
                        item.status === "uploading" ? "warning" : "default"
                      } className="text-[10px]">
                        {item.status === "completed" ? "Done" :
                         item.status === "error" ? "Error" :
                         item.status === "uploading" ? "..." : "Ready"}
                      </Badge>
                      <Badge variant="info" className="text-[10px]">{item.imageType}</Badge>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.status === "pending" || item.status === "error") && (
                        <button
                          onClick={() => removeFile(item.id)}
                          className="p-1 bg-black/50 rounded-lg text-white hover:bg-black/70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {item.status === "uploading" && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <ProgressBar value={item.progress} size="sm" color="primary" />
                      </div>
                    )}
                    {item.status === "pending" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <Button size="sm" onClick={() => uploadFile(item)}>
                          <Upload className="w-3 h-3" /> Upload
                        </Button>
                      </div>
                    )}
                    {item.status === "completed" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => analyzeFile(item)}>
                            <Scan className="w-3 h-3" /> Analyze
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30" onClick={() => window.open(item.preview, "_blank")}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                      item.status === "error" ? "border-danger/50 bg-danger/5" :
                      item.status === "completed" ? "border-success/50 bg-success/5" :
                      "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                      {item.preview ? (
                        <img src={item.preview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileImage className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{item.file.name}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB &middot; {item.imageType}
                      </p>
                      {item.status === "uploading" && <ProgressBar value={item.progress} size="sm" className="mt-1" color="primary" />}
                      {item.error && <p className="text-xs text-danger mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {item.error}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.status === "pending" && (
                        <Button size="sm" onClick={() => uploadFile(item)}>
                          <Upload className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {item.status === "completed" && (
                        <>
                          <Button size="sm" onClick={() => analyzeFile(item)}>
                            <Scan className="w-3.5 h-3.5" /> Analyze
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => window.open(item.preview, "_blank")}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {(item.status === "pending" || item.status === "error") && (
                        <Button size="sm" variant="ghost" onClick={() => removeFile(item.id)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {hasCompleted && (
        <div className="flex gap-3 justify-end flex-wrap">
          <Button variant="outline" onClick={() => router.push("/dashboard/library")}>
            <GalleryHorizontalEnd className="w-4 h-4" /> Media Gallery
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/process")}>
            <Eye className="w-4 h-4" /> Processing Dashboard
          </Button>
          <Button onClick={() => { clearAll(); addToast("Ready for more uploads", "success"); }}>
            <Upload className="w-4 h-4" /> Upload More
          </Button>
        </div>
      )}
    </div>
  );
}
