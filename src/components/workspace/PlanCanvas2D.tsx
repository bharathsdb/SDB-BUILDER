"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Text, Group, Arc, Line, Circle } from "react-konva";
import Konva from "konva";
import { Room, Door, Window } from "@/lib/stores/project-store";

interface PlanCanvas2DProps {
  rooms: Room[];
  doors: Door[];
  windows: Window[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string | null) => void;
  nightMode: boolean;
  isEditMode?: boolean;
  onUpdateRoomsBatch?: (rooms: Room[]) => void;
}

const ROOM_COLORS: Record<string, string> = {
  living: "#fdf8f5",
  bedroom: "#f8f5fa",
  kitchen: "#f4f7f9",
  bathroom: "#f2fcf8",
  office: "#faf8fa",
  dining: "#fdfbf0",
  default: "#fafafa",
};

const ROOM_BORDER_COLORS: Record<string, string> = {
  living: "#1e293b",
  bedroom: "#1e293b",
  kitchen: "#1e293b",
  bathroom: "#1e293b",
  office: "#1e293b",
  dining: "#1e293b",
  default: "#1e293b",
};

export default function PlanCanvas2D({ 
  rooms, doors = [], windows = [], selectedRoomId, onSelectRoom, nightMode, isEditMode, onUpdateRoomsBatch 
}: PlanCanvas2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Local copy of rooms for real-time drag-preview updates
  const [localRooms, setLocalRooms] = useState<Room[]>(rooms);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    setTimeout(() => {
      if (containerRef.current) {
        setPosition({ x: containerRef.current.offsetWidth / 2, y: containerRef.current.offsetHeight / 2 });
      }
    }, 50);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setScale(newScale);
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const getRoomColor = (type?: string) => ROOM_COLORS[type || "default"] || ROOM_COLORS.default;
  const getRoomBorder = (type?: string) => ROOM_BORDER_COLORS[type || "default"] || ROOM_BORDER_COLORS.default;

  const SCALE = 20;

  const getRoomsBoundingBox = () => {
    if (rooms.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rooms.forEach(room => {
      const x = (room.x || 0) * SCALE;
      const y = (room.y || 0) * SCALE;
      const w = room.width * SCALE;
      const h = room.length * SCALE;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
  };

  useEffect(() => {
    if (rooms.length > 0 && dimensions.width > 0) {
      const box = getRoomsBoundingBox();
      const cx = box.minX + box.width / 2;
      const cy = box.minY + box.height / 2;
      setTimeout(() => {
        setPosition({
          x: dimensions.width / 2 - cx * scale,
          y: dimensions.height / 2 - cy * scale
        });
      }, 0);
    }
  }, [rooms.length, dimensions.width]);

  // Collision detection
  const checkCollision = (r1: {x: number, y: number, w: number, h: number}, excludeId: string) => {
    return localRooms.some(r2 => {
      if (r2.id === excludeId) return false;
      const x2 = (r2.x || 0) * SCALE;
      const y2 = (r2.y || 0) * SCALE;
      const w2 = r2.width * SCALE;
      const h2 = r2.length * SCALE;
      return (
        r1.x < x2 + w2 &&
        r1.x + r1.w > x2 &&
        r1.y < y2 + h2 &&
        r1.y + r1.h > y2
      );
    });
  };

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div ref={containerRef} className="w-full h-full relative" />;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ cursor: isEditMode ? "default" : "grab" }}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable={!isEditMode}
        onWheel={handleWheel}
        onDragEnd={(e) => {
          if (!isEditMode) {
            setPosition({ x: e.target.x(), y: e.target.y() });
          }
        }}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            onSelectRoom(null);
          }
        }}
        ref={stageRef}
      >
        <Layer>
          {localRooms.map((room) => {
            const w = room.width * SCALE;
            const h = room.length * SCALE;
            const x = room.x !== undefined ? room.x * SCALE : 0;
            const y = room.y !== undefined ? room.y * SCALE : 0;
            const isSelected = selectedRoomId === room.id;
            const borderColor = getRoomBorder(room.type);
            const fillColor = nightMode ? "#1e293b" : getRoomColor(room.type);
            const textColor = nightMode ? "#cbd5e1" : "#1e293b";
            const wallStrokeColor = nightMode ? "#475569" : borderColor;

            const roomDoors = doors.filter(d => d.room_id === room.id);
            const roomWindows = windows.filter(w => w.room_id === room.id);

            return (
              <Group
                key={room.id}
                x={x}
                y={y}
                draggable={isEditMode}
                onClick={() => onSelectRoom(room.id)}
                onTap={() => onSelectRoom(room.id)}
                dragBoundFunc={(pos) => {
                  if (!isEditMode) return { x: x, y: y };
                  // Snap to grid for visual dragging
                  const newX = Math.round(pos.x / SCALE) * SCALE;
                  const newY = Math.round(pos.y / SCALE) * SCALE;
                  return { x: newX, y: newY };
                }}
                onDragMove={(e) => {
                  if (e.target.name() === "roomGroup") {
                    const newX = e.target.x();
                    const newY = e.target.y();
                    if (checkCollision({ x: newX, y: newY, w, h }, room.id)) {
                      e.target.x(x);
                      e.target.y(y);
                    }
                  }
                }}
                onDragEnd={(e) => {
                  if (e.target.name() === "roomGroup") {
                    const newX = e.target.x();
                    const newY = e.target.y();
                    
                    if (checkCollision({ x: newX, y: newY, w, h }, room.id)) {
                      e.target.x(x);
                      e.target.y(y);
                      return;
                    }
                    
                    if (onUpdateRoomsBatch) {
                      const updatedRooms = localRooms.map(r => 
                        r.id === room.id ? { ...r, x: newX / SCALE, y: newY / SCALE } : r
                      );
                      onUpdateRoomsBatch(updatedRooms);
                    }
                  }
                }}
                name="roomGroup"
              >
                {/* Floor / Wall Boundary */}
                <Rect
                  width={w}
                  height={h}
                  fill={fillColor}
                  stroke={isSelected ? "#3b82f6" : wallStrokeColor}
                  strokeWidth={isSelected ? (isEditMode ? 4 : 8) : 6}
                  shadowColor={nightMode ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"}
                  shadowBlur={isSelected ? 20 : 12}
                  shadowOffset={{ x: 2, y: 4 }}
                />
                
                {roomDoors.map((door, i) => {
                  let dx = 0, dy = 0, rotation = 0;
                  const dw = door.width * SCALE;
                  if (door.wall === "North") { dx = door.position * SCALE - dw / 2; dy = 0; rotation = 0; }
                  else if (door.wall === "South") { dx = door.position * SCALE - dw / 2; dy = h; rotation = 180; }
                  else if (door.wall === "East") { dx = w; dy = door.position * SCALE - dw / 2; rotation = 90; }
                  else if (door.wall === "West") { dx = 0; dy = door.position * SCALE - dw / 2; rotation = -90; }
                  return (
                    <Group key={`door-${i}`} x={dx} y={dy} rotation={rotation}>
                      <Rect x={0} y={-3} width={dw} height={6} fill={fillColor} />
                      <Line points={[0, 0, 0, -dw]} stroke={wallStrokeColor} strokeWidth={2} />
                      <Arc 
                        x={0} y={0} innerRadius={dw} outerRadius={dw} 
                        angle={90} rotation={-90} 
                        stroke={wallStrokeColor} strokeWidth={1} dash={[4, 4]} 
                        opacity={0.6}
                      />
                    </Group>
                  );
                })}

                {roomWindows.map((window, i) => {
                  let dx = 0, dy = 0, isHorizontal = true;
                  const ww = window.width * SCALE;
                  if (window.wall === "North") { dx = window.position * SCALE - ww / 2; dy = 0; }
                  else if (window.wall === "South") { dx = window.position * SCALE - ww / 2; dy = h; }
                  else if (window.wall === "East") { dx = w; dy = window.position * SCALE - ww / 2; isHorizontal = false; }
                  else if (window.wall === "West") { dx = 0; dy = window.position * SCALE - ww / 2; isHorizontal = false; }
                  return (
                    <Group key={`window-${i}`} x={dx} y={dy}>
                      <Rect 
                        x={isHorizontal ? 0 : -3} y={isHorizontal ? -3 : 0} 
                        width={isHorizontal ? ww : 6} height={isHorizontal ? 6 : ww} 
                        fill={nightMode ? "#0f172a" : "#f8fafc"} 
                      />
                      <Line points={isHorizontal ? [0, -1, ww, -1] : [-1, 0, -1, ww]} stroke="#93c5fd" strokeWidth={2} />
                      <Line points={isHorizontal ? [0, 1, ww, 1] : [1, 0, 1, ww]} stroke="#93c5fd" strokeWidth={2} />
                    </Group>
                  );
                })}

                <Text
                  text={room.name}
                  x={0}
                  y={h / 2 - 12}
                  width={w}
                  align="center"
                  fontSize={16}
                  fontFamily="Inter, sans-serif"
                  fontStyle="600"
                  fill={textColor}
                  listening={false}
                />
                <Text
                  text={`${room.width}' x ${room.length}'`}
                  x={0}
                  y={h / 2 + 8}
                  width={w}
                  align="center"
                  fontSize={11}
                  fontFamily="Inter, sans-serif"
                  fill={nightMode ? "#64748b" : "#94a3b8"}
                  listening={false}
                />

                {/* Edit Mode Resize Handles */}
                {isEditMode && isSelected && (
                  <>
                    {/* Right Handle (Width) */}
                    <Rect
                      x={w - 10}
                      y={0}
                      width={20}
                      height={h}
                      fill="transparent"
                      draggable
                      dragBoundFunc={(pos) => {
                        // pos.x is relative to the stage, we need to map back to local group coordinates later.
                        // wait, dragBoundFunc pos is absolute stage pos.
                        // Actually pos is absolute if dragBoundFunc is used, but for simple group elements it is relative to parent group?
                        // No, in Konva pos is absolute stage coordinate by default.
                        // But since x,y of e.target are local, it's easier to just use onDragMove/End without dragBoundFunc,
                        // or do the snapping inside dragBoundFunc if we convert it.
                        // To keep it safe, let's just use onDragMove.
                        return pos; 
                      }}
                      onDragMove={(e) => {
                         // restrict to X axis locally
                         e.target.y(0);
                      }}
                      onDragEnd={(e) => {
                        e.cancelBubble = true;
                        // local x of the handle
                        const handleLocalX = e.target.x();
                        const snappedW = Math.max(2 * SCALE, Math.round(handleLocalX / SCALE) * SCALE);
                        
                        if (checkCollision({ x, y, w: snappedW, h }, room.id)) {
                          e.target.x(w - 10);
                          return;
                        }
                        
                        if (onUpdateRoomsBatch) {
                          const updatedRooms = localRooms.map(r => 
                            r.id === room.id ? { ...r, width: snappedW / SCALE } : r
                          );
                          onUpdateRoomsBatch(updatedRooms);
                        }
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'ew-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />

                    {/* Bottom Handle (Length) */}
                    <Rect
                      x={0}
                      y={h - 10}
                      width={w}
                      height={20}
                      fill="transparent"
                      draggable
                      onDragMove={(e) => {
                         e.target.x(0);
                      }}
                      onDragEnd={(e) => {
                        e.cancelBubble = true;
                        const handleLocalY = e.target.y();
                        const snappedH = Math.max(2 * SCALE, Math.round(handleLocalY / SCALE) * SCALE);
                        
                        if (checkCollision({ x, y, w, h: snappedH }, room.id)) {
                          e.target.y(h - 10);
                          return;
                        }
                        
                        if (onUpdateRoomsBatch) {
                          const updatedRooms = localRooms.map(r => 
                            r.id === room.id ? { ...r, length: snappedH / SCALE } : r
                          );
                          onUpdateRoomsBatch(updatedRooms);
                        }
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'ns-resize';
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container();
                        if (container) container.style.cursor = 'default';
                      }}
                    />
                    
                    {/* Visual anchors for the handles */}
                    <Circle x={w} y={h/2} radius={5} fill="#3b82f6" stroke="#fff" strokeWidth={2} listening={false} />
                    <Circle x={w/2} y={h} radius={5} fill="#3b82f6" stroke="#fff" strokeWidth={2} listening={false} />
                  </>
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
