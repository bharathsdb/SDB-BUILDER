"use client";

import * as React from "react";
import {
  ZoomIn, ZoomOut, RotateCcw, Maximize, Maximize2,
  Minimize, Download, Share2, Loader2, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  url: string;
  name: string;
}

export default function ImageViewer({ url, name }: ImageViewerProps) {
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Reset view
  const handleReset = React.useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Zoom controls
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  const handleFit = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Fullscreen controls
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

  // Pan controls (Mouse Events)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return; // Only pan when zoomed in
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Pinch to Zoom (Touch Events)
  const touchStartRef = React.useRef({ x1: 0, y1: 0, x2: 0, y2: 0, dist: 0 });

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartRef.current = {
        x1: t1.clientX,
        y1: t1.clientY,
        x2: t2.clientX,
        y2: t2.clientY,
        dist
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const startDist = touchStartRef.current.dist;

      if (startDist > 0) {
        const factor = dist / startDist;
        setScale(prev => Math.max(0.5, Math.min(5, prev * factor)));
        touchStartRef.current.dist = dist; // update dist to continue smoothly
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current.dist = 0;
  };

  // Double click to zoom
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale > 1) {
      handleReset();
    } else {
      setScale(2);
      // Center zoom around cursor if possible
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;
        setOffset({ x: -mouseX, y: -mouseY });
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const delta = e.deltaY < 0 ? 1 : -1;
    setScale(prev => Math.max(0.5, Math.min(5, prev + delta * zoomIntensity)));
  };

  // Download image
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "plancraft-export.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share image
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `Check out ${name} on PlanCraftAI`,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert("Image link copied to clipboard!");
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full h-full min-h-[350px] bg-slate-900 overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Loading State */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-300 z-10 p-4">
          <EyeOff className="w-12 h-12 text-slate-500 mb-3" />
          <p className="font-semibold text-lg">Failed to load asset</p>
          <p className="text-sm text-slate-500 text-center max-w-xs mt-1">
            The image could not be loaded. It may have been deleted or moved.
          </p>
        </div>
      )}

      {/* Interactive Image Container */}
      {!error && (
        <div
          className="flex items-center justify-center w-full h-full cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)` }}
          onDoubleClick={handleDoubleClick}
        >
          <img
            ref={imgRef}
            src={url}
            alt={name}
            className="max-w-full max-h-full object-contain pointer-events-none transition-shadow duration-300 shadow-xl"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </div>
      )}

      {/* Floating Toolbar with Glassmorphism */}
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
          onClick={handleFit}
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
          onClick={handleReset}
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
          onClick={handleDownload}
          title="Download"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:bg-white/10 rounded-xl"
          onClick={handleShare}
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Info indicator */}
      {scale !== 1 && (
        <div className="absolute top-4 left-4 px-2.5 py-1 text-xs text-white/60 bg-black/40 backdrop-blur-sm rounded-md border border-white/5 pointer-events-none">
          {Math.round(scale * 100)}% Zoom
        </div>
      )}
    </div>
  );
}
