"use client";

import React, { useState } from "react";
import { RoomLayout } from "@/lib/api/openai-render";
import { ImageIcon } from "lucide-react";

interface FloorPlanOverlayProps {
  imageUrl: string;
  roomLayoutData: RoomLayout[];
  mode: "2D" | "3D";
  plotWidth?: number; // fallback to derived if missing
  plotHeight?: number; // fallback to derived if missing
}

export function FloorPlanOverlay({
  imageUrl,
  roomLayoutData,
  mode,
  plotWidth = 50,
  plotHeight = 50,
}: FloorPlanOverlayProps) {
  const [imageError, setImageError] = useState(false);

  // Derive plot width/height from rooms if not provided
  const derivedWidth = React.useMemo(() => {
    return Math.max(
      plotWidth,
      ...roomLayoutData.map((r) => (r.x || 0) + (r.width || 0) / 2)
    );
  }, [roomLayoutData, plotWidth]);

  const derivedHeight = React.useMemo(() => {
    return Math.max(
      plotHeight,
      ...roomLayoutData.map((r) => (r.y || 0) + (r.length || 0) / 2)
    );
  }, [roomLayoutData, plotHeight]);

  // Coordinate Mapping Helper
  const mapRoomToOverlayPosition = (
    room: RoomLayout,
    pw: number,
    ph: number
  ) => {
    // If x/y are missing, generate a deterministic pseudo-random position
    // based on room name just for visual fallback, or center it.
    // In production, the Kotlin engine would always supply x/y.
    const roomX = room.x ?? Math.abs(hashCode(room.name)) % pw;
    const roomY = room.y ?? Math.abs(hashCode(room.name + "y")) % ph;

    let leftPercent = (roomX / pw) * 100;
    let topPercent = (roomY / ph) * 100;

    if (mode === "3D") {
      // Approximate 3D isometric mapping shift
      // This is a naive offset since true projection requires z-index and camera angle
      leftPercent = leftPercent * 0.8 + 10;
      topPercent = topPercent * 0.7 + 15;
    } else {
      // 2D orthographic is generally straightforward, but we add a margin
      // so labels aren't cut off at the exact edge of the canvas.
      leftPercent = Math.max(5, Math.min(95, leftPercent));
      topPercent = Math.max(5, Math.min(95, topPercent));
    }

    return { leftPercent, topPercent };
  };

  // Nudge overlapping labels slightly (Basic collision offset)
  const calculateAdjustedPositions = () => {
    const positions = roomLayoutData.map((room) => ({
      room,
      pos: mapRoomToOverlayPosition(room, derivedWidth, derivedHeight),
    }));

    // Extremely simple O(N^2) overlap nudge for v1
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const p1 = positions[i].pos;
        const p2 = positions[j].pos;
        const dist = Math.sqrt(
          Math.pow(p1.leftPercent - p2.leftPercent, 2) +
            Math.pow(p1.topPercent - p2.topPercent, 2)
        );
        if (dist < 10) {
          // Nudge apart
          p2.topPercent += 5;
          p2.leftPercent += (i % 2 === 0 ? 5 : -5);
        }
      }
    }
    return positions;
  };

  const labelPositions = calculateAdjustedPositions();

  if (imageError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-lg text-slate-500 border border-slate-800">
        <ImageIcon className="w-12 h-12 opacity-20 mb-2" />
        <p>Failed to load image</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full min-h-[300px] flex items-center justify-center rounded-lg overflow-hidden shadow-xl"
      data-testid={`floor-plan-overlay-${mode.toLowerCase()}`}
    >
      <img
        src={imageUrl}
        alt={`${mode} Floor Plan`}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
        data-testid={`preview-${mode.toLowerCase()}-image`}
      />

      <div className="absolute inset-0 pointer-events-none">
        {labelPositions.map(({ room, pos }, idx) => (
          <div
            key={`${room.name}-${idx}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform hover:scale-110"
            style={{
              left: `${pos.leftPercent}%`,
              top: `${pos.topPercent}%`,
            }}
            data-testid={`room-label-${room.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-700/50 shadow-lg whitespace-nowrap">
              {room.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple deterministic hash for fallback coordinates
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}
