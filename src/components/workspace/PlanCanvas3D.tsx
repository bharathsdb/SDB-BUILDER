"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Sky, ContactShadows } from "@react-three/drei";
import { Room, Door, Window } from "@/lib/stores/project-store";
import * as THREE from "three";

interface PlanCanvas3DProps {
  rooms: Room[];
  doors?: Door[];
  windows?: Window[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string | null) => void;
  nightMode: boolean;
}

const ROOM_COLORS: Record<string, string> = {
  living: "#d4b895", // warm wood tone
  bedroom: "#d4b895", // warm wood tone
  kitchen: "#e2e8f0", // light gray tile tone
  bathroom: "#e2e8f0", // light gray tile tone
  office: "#c2a685", // slightly darker wood
  dining: "#d4b895", // warm wood tone
  default: "#e2e8f0",
};

const ROOM_MATERIAL_PROPS: Record<string, { roughness: number, metalness: number }> = {
  living: { roughness: 0.6, metalness: 0.1 }, // Matte wood/carpet feel
  bedroom: { roughness: 0.8, metalness: 0.05 }, // Soft matte
  kitchen: { roughness: 0.2, metalness: 0.2 }, // Glossy tile
  bathroom: { roughness: 0.1, metalness: 0.3 }, // High gloss tile
  office: { roughness: 0.5, metalness: 0.1 },
  dining: { roughness: 0.4, metalness: 0.15 },
  default: { roughness: 0.7, metalness: 0.1 },
};

const WALL_COLOR = "#f8fafc";
const WALL_THICKNESS = 0.5;
const WALL_HEIGHT = 10;

function Room3D({ room, doors = [], windows = [], isSelected, onClick }: { room: Room; doors: Door[]; windows: Window[]; isSelected: boolean; onClick: () => void }) {
  const w = room.width;
  const l = room.length;
  const x = room.x !== undefined ? room.x : 0;
  const z = room.y !== undefined ? room.y : 0;

  // Center coordinates of the room
  const cx = x + w / 2;
  const cz = z + l / 2;

  const color = ROOM_COLORS[room.type || "default"] || ROOM_COLORS.default;
  const matProps = ROOM_MATERIAL_PROPS[room.type || "default"] || ROOM_MATERIAL_PROPS.default;

  // We need to define walls
  const walls = [
    // North wall
    { pos: [0, WALL_HEIGHT / 2, -l / 2 + WALL_THICKNESS / 2], args: [w, WALL_HEIGHT, WALL_THICKNESS] },
    // South wall
    { pos: [0, WALL_HEIGHT / 2, l / 2 - WALL_THICKNESS / 2], args: [w, WALL_HEIGHT, WALL_THICKNESS] },
    // East wall
    { pos: [w / 2 - WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0], args: [WALL_THICKNESS, WALL_HEIGHT, l] },
    // West wall
    { pos: [-w / 2 + WALL_THICKNESS / 2, WALL_HEIGHT / 2, 0], args: [WALL_THICKNESS, WALL_HEIGHT, l] },
  ];

  return (
    <group position={[cx, 0, cz]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial 
          color={isSelected ? "#bfdbfe" : color} 
          roughness={matProps.roughness} 
          metalness={matProps.metalness}
        />
      </mesh>

      {/* Walls */}
      {walls.map((wall, i) => (
        <mesh key={`wall-${i}`} position={wall.pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={wall.args as [number, number, number]} />
          <meshStandardMaterial color={isSelected ? "#93c5fd" : WALL_COLOR} roughness={0.9} metalness={0.05} />
        </mesh>
      ))}

      {/* Doors */}
      {doors.map((door, i) => {
        let dx = 0, dz = 0;
        const thickness = WALL_THICKNESS + 0.1; // slightly thicker to avoid z-fighting
        let args: [number, number, number] = [door.width, door.height, thickness];
        
        if (door.wall === "North") { dx = door.position - w / 2; dz = -l / 2 + WALL_THICKNESS / 2; }
        else if (door.wall === "South") { dx = door.position - w / 2; dz = l / 2 - WALL_THICKNESS / 2; }
        else if (door.wall === "East") { dx = w / 2 - WALL_THICKNESS / 2; dz = door.position - l / 2; args = [thickness, door.height, door.width]; }
        else if (door.wall === "West") { dx = -w / 2 + WALL_THICKNESS / 2; dz = door.position - l / 2; args = [thickness, door.height, door.width]; }

        return (
          <mesh key={`door-${i}`} position={[dx, door.height / 2, dz]} castShadow receiveShadow>
            <boxGeometry args={args} />
            <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.2} />
          </mesh>
        );
      })}

      {/* Windows */}
      {windows.map((window, i) => {
        let dx = 0, dz = 0;
        const thickness = WALL_THICKNESS + 0.2; 
        const yOffset = 3; // Window height from floor
        let args: [number, number, number] = [window.width, window.height, thickness];
        
        if (window.wall === "North") { dx = window.position - w / 2; dz = -l / 2 + WALL_THICKNESS / 2; }
        else if (window.wall === "South") { dx = window.position - w / 2; dz = l / 2 - WALL_THICKNESS / 2; }
        else if (window.wall === "East") { dx = w / 2 - WALL_THICKNESS / 2; dz = window.position - l / 2; args = [thickness, window.height, window.width]; }
        else if (window.wall === "West") { dx = -w / 2 + WALL_THICKNESS / 2; dz = window.position - l / 2; args = [thickness, window.height, window.width]; }

        return (
          <group key={`window-${i}`} position={[dx, yOffset + window.height / 2, dz]}>
            {/* Glass */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={args} />
              <meshPhysicalMaterial 
                color="#e0f2fe" 
                transmission={0.9} 
                opacity={1} 
                roughness={0.1} 
                ior={1.5} 
                thickness={0.5} 
              />
            </mesh>
            {/* Frame outline (simple representation) */}
            <mesh>
              <boxGeometry args={[args[0] + 0.1, args[1] + 0.1, args[2] - 0.1]} />
              <meshStandardMaterial color="#1e293b" wireframe />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function PlanCanvas3D({ rooms, doors = [], windows = [], selectedRoomId, onSelectRoom, nightMode }: PlanCanvas3DProps) {
  // Center camera on the entire plan
  const center = useMemo(() => {
    if (rooms.length === 0) return [0, 0, 0];
    let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
    rooms.forEach((r) => {
      const x = r.x || 0;
      const z = r.y || 0;
      if (x < minX) minX = x;
      if (z < minZ) minZ = z;
      if (x + r.width > maxX) maxX = x + r.width;
      if (z + r.length > maxZ) maxZ = z + r.length;
    });
    return [(minX + maxX) / 2, 0, (minZ + maxZ) / 2];
  }, [rooms]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [center[0] + 40, 45, center[2] + 45], fov: 45 }}>
        {nightMode ? (
          <>
            <ambientLight intensity={0.2} />
            <hemisphereLight args={["#0f172a", "#334155", 0.3]} />
            <directionalLight 
              position={[10, 30, 20]} 
              intensity={0.6} 
              castShadow 
              shadow-mapSize={[2048, 2048]} 
            />
            <pointLight position={[center[0], 20, center[2]]} intensity={0.8} color="#fcd34d" />
            <color attach="background" args={["#0f172a"]} />
          </>
        ) : (
          <>
            <Sky sunPosition={[100, 20, 100]} turbidity={0.2} rayleigh={0.5} />
            <ambientLight intensity={0.3} />
            <hemisphereLight args={["#ffffff", "#94a3b8", 0.5]} />
            <directionalLight 
              position={[50, 80, 40]} 
              intensity={1.2} 
              castShadow 
              shadow-mapSize={[4096, 4096]} 
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
              shadow-bias={-0.0001}
            />
            <color attach="background" args={["#f1f5f9"]} />
          </>
        )}

        <Grid
          infiniteGrid
          fadeDistance={200}
          sectionColor={nightMode ? "#334155" : "#cbd5e1"}
          cellColor={nightMode ? "#1e293b" : "#e2e8f0"}
          position={[0, -0.05, 0]}
        />
        
        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.4} 
          scale={150} 
          blur={2} 
          far={10} 
          resolution={1024} 
          color="#000000" 
        />

        <group onClick={() => onSelectRoom(null)}>
          {rooms.map((room) => (
            <Room3D
              key={room.id}
              room={room}
              doors={doors.filter(d => d.room_id === room.id)}
              windows={windows.filter(w => w.room_id === room.id)}
              isSelected={selectedRoomId === room.id}
              onClick={() => onSelectRoom(room.id)}
            />
          ))}
        </group>

        <OrbitControls target={center as [number, number, number]} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>
    </div>
  );
}
