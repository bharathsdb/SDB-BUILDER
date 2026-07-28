/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  RotateCcw, Play, Pause, Sun, Moon,
  Maximize, Minimize, Loader2, EyeOff, Info,
  ZoomIn, ZoomOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModelViewerProps {
  url: string;
  name: string;
}

export default function ModelViewer({ url, name }: ModelViewerProps) {
  const [modelViewerLoaded, setModelViewerLoaded] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  
  const [autoRotate, setAutoRotate] = React.useState(false);
  const [isBrightLighting, setIsBrightLighting] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewerRef = React.useRef<any>(null);

  // Load web component client-side only
  React.useEffect(() => {
    import("@google/model-viewer")
      .then(() => setModelViewerLoaded(true))
      .catch(() => setError(true));
  }, []);

  // Track progress events
  React.useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleProgress = (e: any) => {
      const details = e.detail || {};
      const totalProgress = details.totalProgress || 0;
      setProgress(Math.round(totalProgress * 100));
      if (totalProgress === 1) {
        setLoading(false);
      }
    };

    const handleError = () => {
      setLoading(false);
      setError(true);
    };

    const handleLoad = () => {
      setLoading(false);
    };

    viewer.addEventListener("progress", handleProgress);
    viewer.addEventListener("error", handleError);
    viewer.addEventListener("load", handleLoad);

    return () => {
      viewer.removeEventListener("progress", handleProgress);
      viewer.removeEventListener("error", handleError);
      viewer.removeEventListener("load", handleLoad);
    };
  }, [modelViewerLoaded]);

  // Reset Camera position
  const handleResetCamera = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.cameraOrbit = "0deg 75deg auto";
    viewer.fieldOfView = "auto";
  };

  // Programmatic Zoom
  const handleZoomIn = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    
    // Zoom by reducing FOV
    const currentFovStr = viewer.fieldOfView || "auto";
    let currentFov = 45;
    if (currentFovStr !== "auto") {
      currentFov = parseFloat(currentFovStr);
    }
    viewer.fieldOfView = `${Math.max(10, currentFov - 5)}deg`;
  };

  const handleZoomOut = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    
    // Zoom out by increasing FOV
    const currentFovStr = viewer.fieldOfView || "auto";
    let currentFov = 45;
    if (currentFovStr !== "auto") {
      currentFov = parseFloat(currentFovStr);
    }
    viewer.fieldOfView = `${Math.min(90, currentFov + 5)}deg`;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const isObjFormat = url.toLowerCase().endsWith(".obj");

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 overflow-hidden select-none"
    >
      {/* Loading Overlay */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-10 p-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
          <p className="text-slate-300 font-medium text-sm">Loading 3D Scene...</p>
          <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mt-2 border border-white/5">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">{progress}% loaded</p>
        </div>
      )}

      {/* Format Warning for OBJ */}
      {isObjFormat && (
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-2.5 p-3 rounded-xl backdrop-blur-md bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">OBJ File Detected</p>
            <p className="text-amber-300/80 mt-0.5">
              OBJ is a legacy format. Google Model Viewer natively displays optimized GLB/GLTF.
              We will attempt loading, but converting to GLB is highly recommended for best web performance.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-300 z-10 p-4">
          <EyeOff className="w-12 h-12 text-slate-500 mb-3" />
          <p className="font-semibold text-lg">Failed to render 3D model</p>
          <p className="text-sm text-slate-500 text-center max-w-xs mt-1">
            This model file format is not supported directly by model-viewer or the file is corrupted.
            Ensure you use valid standard `.glb` or `.gltf` files.
          </p>
        </div>
      )}

      {/* Model Viewer Web Component */}
      {modelViewerLoaded && !error && React.createElement("model-viewer", {
        ref: viewerRef,
        src: url,
        alt: name,
        "camera-controls": true,
        "auto-rotate": autoRotate ? true : undefined,
        "shadow-intensity": "1.2",
        "shadow-softness": "0.8",
        exposure: isBrightLighting ? "1.2" : "0.5",
        "interaction-prompt": "auto",
        "interaction-prompt-style": "wiggle",
        loading: "eager",
        style: { width: "100%", height: "100%", outline: "none" },
        "touch-action": "pan-y",
      })}

      {/* Bottom Floating Control Bar */}
      {!error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-lg bg-black/40 border border-white/10 shadow-2xl z-20 transition-all duration-300 hover:bg-black/55 hover:border-white/20">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
            onClick={handleResetCamera}
            title="Reset Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-xl ${autoRotate ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-white hover:bg-white/10"}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Pause Auto Rotation" : "Auto Rotate"}
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
            onClick={() => setIsBrightLighting(!isBrightLighting)}
            title="Toggle Lighting Style"
          >
            {isBrightLighting ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-sky-300" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* Helpful drag tooltip for desktop */}
      {!loading && !error && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-white/50 bg-black/40 backdrop-blur-sm rounded-md border border-white/5 pointer-events-none">
          <Info className="w-3.5 h-3.5" />
          Drag to Rotate &bull; Scroll to Zoom
        </div>
      )}
    </div>
  );
}
