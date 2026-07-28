"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, ContactShadows, Float, Text } from "@react-three/drei";
import {
  ArrowLeft, Hexagon, Sun, Moon, RotateCcw,
  Camera, Play, Search, Maximize, Settings2, Home,
  Layers, Eye, Footprints, ZoomIn,
} from "lucide-react";
import * as THREE from "three";

interface RoomData {
  id: string; name: string; type: string;
  x: number; y: number; width: number; length: number;
  color?: string; area_sqft?: number;
}

const ROOM_COLORS: Record<string, string> = {
  living: "#f0fdf4", kitchen: "#fef2f2", bedroom: "#eff6ff",
  bathroom: "#f8fafc", dining: "#fefce8", office: "#f5f3ff",
  circulation: "#f1f5f9", parking: "#f1f5f9", garden: "#f0fdf4",
};

const WALL_COLOR = "#f0f0f0";
const FLOOR_COLOR = "#e0e0e0";
const ROOF_COLOR = "#c4a882";

function BuildingModel({ rooms }: { rooms: RoomData[] }) {
  const group = React.useRef<THREE.Group>(null);

  if (!rooms || rooms.length === 0) {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 20]} />
          <meshStandardMaterial color="#e8f4e8" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[16, 3, 12]} />
          <meshStandardMaterial color="#f5f0e1" />
        </mesh>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[18, 0.3, 14]} />
          <meshStandardMaterial color={ROOF_COLOR} />
        </mesh>
        <mesh position={[0, 3.8, 0]}>
          <coneGeometry args={[10, 2.5, 4]} />
          <meshStandardMaterial color="#a0522d" />
        </mesh>
      </group>
    );
  }

  const wallHeight = 10;
  const wallThickness = 0.5;

  return (
    <group ref={group}>
      {rooms.map((room) => {
        const rx = room.x || 0;
        const rz = room.y || 0;
        const rw = Math.max(room.width || 10, 5);
        const rd = Math.max(room.length || 10, 5);
        const color = room.color || ROOM_COLORS[room.type] || "#f8fafc";

        return (
          <group key={room.id}>
            {/* Floor */}
            <mesh position={[rx + rw / 2, -0.1, rz + rd / 2]}>
              <boxGeometry args={[rw, 0.2, rd]} />
              <meshStandardMaterial color={FLOOR_COLOR} />
            </mesh>

            {/* Walls */}
            {[
              { pos: [rx + rw / 2, wallHeight / 2, rz], size: [rw, wallHeight, wallThickness] },
              { pos: [rx + rw / 2, wallHeight / 2, rz + rd], size: [rw, wallHeight, wallThickness] },
              { pos: [rx + rw, wallHeight / 2, rz + rd / 2], size: [wallThickness, wallHeight, rd] },
              { pos: [rx, wallHeight / 2, rz + rd / 2], size: [wallThickness, wallHeight, rd] },
            ].map((wall, wi) => (
              <mesh key={wi} position={wall.pos as [number, number, number]}>
                <boxGeometry args={wall.size as [number, number, number]} />
                <meshStandardMaterial color={WALL_COLOR} />
              </mesh>
            ))}

            {/* Ceiling */}
            <mesh position={[rx + rw / 2, wallHeight, rz + rd / 2]}>
              <boxGeometry args={[rw, 0.2, rd]} />
              <meshStandardMaterial color="#d0d0d0" />
            </mesh>

            {/* Roof */}
            <mesh position={[rx + rw / 2, wallHeight + 0.3, rz + rd / 2]}>
              <boxGeometry args={[rw + 1, 0.3, rd + 1]} />
              <meshStandardMaterial color={ROOF_COLOR} />
            </mesh>

            {/* Door marker */}
            <mesh position={[rx + rw, wallHeight / 2, rz + rd / 2]}>
              <boxGeometry args={[0.1, 6, 3]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Window markers */}
            <mesh position={[rx + rw / 2, wallHeight / 2, rz]} rotation={[0, 0, 0]}>
              <boxGeometry args={[4, 4, 0.1]} />
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.6} />
            </mesh>

            {/* Room label */}
            <Text
              position={[rx + rw / 2, 0.5, rz + rd / 2]}
              fontSize={1.2}
              color="#1e293b"
              anchorX="center"
              anchorY="middle"
            >
              {room.name}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

function Viewer3DContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dayMode, setDayMode] = React.useState(true);
  const [walkMode, setWalkMode] = React.useState(false);
  const [rooms] = React.useState<RoomData[]>(() => {
    const roomsParam = searchParams.get("rooms");
    if (roomsParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(roomsParam));
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden transition-colors duration-1000 ${dayMode ? 'bg-sky-100' : 'bg-slate-950'}`}>
      <header className="absolute top-0 left-0 w-full p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Link href={rooms.length > 0 ? "/dashboard/process" : "/workspace"}
            className={`p-2 rounded-lg transition-colors ${dayMode ? 'bg-white/80 hover:bg-white text-slate-700' : 'bg-black/50 hover:bg-black/80 text-slate-300'}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm backdrop-blur-md shadow-sm flex items-center gap-2 ${dayMode ? 'bg-white/80 text-slate-800' : 'bg-black/50 text-slate-200'}`}>
            <Hexagon className="w-4 h-4 text-primary" />
            {rooms.length > 0 ? `AI Generated Model (${rooms.length} rooms)` : "3D Preview"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-lg p-1 backdrop-blur-md ${dayMode ? 'bg-white/80' : 'bg-black/50'}`}>
            <Link href="/workspace/2d" className={`px-3 py-1 text-xs font-medium transition-colors ${dayMode ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-100'}`}>2D</Link>
            <button className={`px-3 py-1 text-xs font-semibold shadow rounded-md ${dayMode ? 'bg-white text-slate-800' : 'bg-slate-800 text-white'}`}>3D</button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <Canvas camera={{ position: walkMode ? [5, 2, 15] : [rooms.length > 0 ? Math.max(25, rooms.length * 5) : 20, 15, 20], fov: walkMode ? 70 : 45 }}>
          {dayMode ? (
            <Sky sunPosition={[100, 20, 100]} />
          ) : (
            <ambientLight intensity={0.2} />
          )}
          <ambientLight intensity={dayMode ? 0.5 : 0.1} />
          <directionalLight
            position={dayMode ? [20, 30, 10] : [5, 5, -5]}
            intensity={dayMode ? 1.5 : 0.3}
            castShadow
          />
          <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
            <BuildingModel rooms={rooms} />
          </Float>
          <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={rooms.length > 0 ? Math.max(30, rooms.length * 8) : 25} blur={2} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2.2}
            target={walkMode ? [5, 1, 5] : [0, 0, 0]}
          />
        </Canvas>
      </main>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl backdrop-blur-md shadow-xl z-20 border transition-colors duration-1000 bg-white/80 dark:bg-black/60 border-slate-200 dark:border-slate-800">
        <button onClick={() => setDayMode(!dayMode)}
          className={`p-3 rounded-xl transition-colors ${dayMode ? 'hover:bg-slate-100 text-slate-700' : 'bg-slate-800 text-yellow-400 hover:bg-slate-700'}`}
          title="Toggle Day/Night">
          {dayMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-1" />
        <button onClick={() => setWalkMode(!walkMode)}
          className={`p-3 rounded-xl transition-colors ${walkMode ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300'}`}
          title="Walk-through Mode">
          <Footprints className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
          title="Reset View">
          <RotateCcw className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-slate-300 dark:bg-slate-700 mx-1" />
        <button className="p-3 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
          title="Room Overview">
          <Home className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
          title="Inspect">
          <Eye className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
          title="Measure">
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function Viewer3DPage() {
  return (
    <React.Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-sky-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <Viewer3DContent />
    </React.Suspense>
  );
}
