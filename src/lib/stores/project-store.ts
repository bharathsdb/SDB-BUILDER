import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "../api-client";

export interface Room {
  id: string; name: string; width: number; length: number; level: number;
  area?: number; ceiling?: number; type?: string; color?: string;
  x?: number; y?: number;
}
export interface Door {
  room_id: string; wall: string; position: number; width: number; height: number;
}
export interface Window {
  room_id: string; wall: string; position: number; width: number; height: number; type?: string;
}
export interface CostEstimate {
  id?: string; foundation: number; concrete: number; steel: number; brick: number;
  flooring: number; plumbing: number; electrical: number; labor: number;
  total: number; contingency?: number; designFees?: number;
}
export interface Material {
  id: string; name: string; type: string; cost: number; unit: string;
  brand?: string; color?: string; sustainability?: number; inStock?: boolean;
}
export interface ProjectAsset {
  id: string;
  name: string;
  type: string; // "image/png", "model/gltf-binary", etc.
  url: string;
  category: "blueprint" | "render" | "elevation" | "3d" | "asset";
  size?: string;
  createdAt: string;
}

export interface Project {
  id: string; name: string; description: string; userId: string;
  plotLength: number; plotWidth: number; facing: string; floors: number;
  budgetTier: string; style: string; vastu: boolean;
  status: "draft" | "completed" | "generating" | "archived";
  thumbnail?: string; createdAt: string; updatedAt: string; teamId?: string;
  rooms: Room[]; doors?: Door[]; windows?: Window[]; materials: Material[]; costEstimate?: CostEstimate;
  tags?: string[]; shared?: boolean; shareUrl?: string; viewCount?: number;
  vastuScore?: number; sustainabilityScore?: number; stars?: number;
  assets?: ProjectAsset[];
}

const getMockAssets = (p: Project): ProjectAsset[] => {
  const style = p.style || "Modern";
  const isModern = style.toLowerCase().includes("modern") || style.toLowerCase().includes("luxury");
  const isContemporary = style.toLowerCase().includes("contemporary");
  const baseImg = isModern 
    ? "/images/showcase/modern_luxury_villa.png" 
    : (isContemporary ? "/images/showcase/compact_urban_duplex.png" : "/images/showcase/scandinavian_apartment.png");

  return [
    {
      id: `a-blue-${p.id}`,
      name: "Blueprint_2D_Layout.png",
      type: "image/png",
      url: baseImg,
      category: "blueprint",
      size: "1.2 MB",
      createdAt: p.createdAt || new Date().toISOString()
    },
    {
      id: `a-pres-${p.id}`,
      name: "Presentation_Floor_Plan.png",
      type: "image/png",
      url: baseImg,
      category: "blueprint",
      size: "2.4 MB",
      createdAt: p.createdAt || new Date().toISOString()
    },
    {
      id: `a-3d-${p.id}`,
      name: "Interactive_3D_Model.glb",
      type: "model/gltf-binary",
      url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
      category: "3d",
      size: "4.8 MB",
      createdAt: p.createdAt || new Date().toISOString()
    },
    {
      id: `a-elev-f-${p.id}`,
      name: "Front_Elevation.png",
      type: "image/png",
      url: "/images/showcase/modern_luxury_villa.png",
      category: "elevation",
      size: "920 KB",
      createdAt: p.createdAt || new Date().toISOString()
    },
    {
      id: `a-elev-s-${p.id}`,
      name: "Side_Elevation.png",
      type: "image/png",
      url: "/images/showcase/compact_urban_duplex.png",
      category: "elevation",
      size: "850 KB",
      createdAt: p.createdAt || new Date().toISOString()
    },
    {
      id: `a-render-int-${p.id}`,
      name: "Interior_Living_Render.png",
      type: "image/png",
      url: "/images/showcase/scandinavian_apartment.png",
      category: "render",
      size: "1.5 MB",
      createdAt: p.createdAt || new Date().toISOString()
    }
  ];
};

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  setCurrentProject: (id: string) => void;
  createProject: (data: Partial<Project>) => Promise<Project>;
  duplicateProject: (id: string) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => void;
  generatePlan: (id: string) => Promise<void>;
  addRoom: (projectId: string, room: { name: string; width: number; length: number; level: number; x?: number; y?: number; type?: string }) => void;
  updateRoom: (projectId: string, roomId: string, updates: Partial<Room>) => void;
  removeRoom: (projectId: string, roomId: string) => void;
  fetchProjects: () => Promise<void>;
  addProjectAsset: (projectId: string, asset: Omit<ProjectAsset, "id" | "createdAt">) => void;
  renameProjectAsset: (projectId: string, assetId: string, newName: string) => void;
  deleteProjectAsset: (projectId: string, assetId: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,

      fetchProjects: async () => {
        try {
          const res = await apiClient("/api/projects");
          const data = await res.json();
          if (res.ok && data.projects) {
            const projectsWithAssets = data.projects.map((p: Project) => ({
              ...p,
              assets: p.assets && p.assets.length > 0 ? p.assets : getMockAssets(p)
            }));
            set({ projects: projectsWithAssets });
          }
        } catch {}
      },

      setCurrentProject: (id: string) => {
        const project = get().projects.find((p) => p.id === id) || null;
        set({ currentProject: project });
      },

      createProject: async (data) => {
        set({ isLoading: true });
        try {
          const res = await apiClient("/api/projects", {
            method: "POST",
            body: JSON.stringify(data)
          });
          const resData = await res.json();
          
          if (!res.ok) throw new Error("Failed to create project");
          
          const projectWithAssets = {
            ...resData.project,
            assets: getMockAssets(resData.project)
          };
          
          set((state) => ({
            projects: [projectWithAssets, ...state.projects],
            currentProject: projectWithAssets,
            isLoading: false,
          }));
          return projectWithAssets;
        } catch {
          set({ isLoading: false });
          throw new Error("Failed to create project");
        }
      },

      duplicateProject: async (id) => {
        try {
          const res = await apiClient(`/api/projects/${id}/duplicate`, { method: "POST" });
          const data = await res.json();
          if (!res.ok) return null;
          const dup = {
            ...data.project,
            assets: getMockAssets(data.project)
          };
          set((state) => ({ projects: [dup, ...state.projects], currentProject: dup }));
          return dup;
        } catch {
          return null;
        }
      },

      deleteProject: async (id) => {
        try {
          await apiClient(`/api/projects/${id}`, { method: "DELETE" });
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
          }));
        } catch {}
      },

      updateProject: async (id, data) => {
        try {
          await apiClient(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
        } catch (err) {
          console.error("Failed to update project", err);
        }
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)),
          currentProject: state.currentProject?.id === id ? { ...state.currentProject, ...data } : state.currentProject,
        }));
      },

      generatePlan: async (id) => {
        set({ isLoading: true });
        try {
          const res = await apiClient(`/api/projects/${id}/generate`, { method: "POST" });
          const data = await res.json();
          if (res.ok && data.project) {
            const project = {
              ...data.project,
              assets: getMockAssets(data.project)
            };
            set((state) => ({
              projects: state.projects.map((p) => p.id === id ? project : p),
              isLoading: false,
            }));
          }
        } catch {
          set({ isLoading: false });
        }
      },

      addRoom: (projectId, room) => {
        const newRoom: Room = { id: `r${Date.now()}`, ...room };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, rooms: [...p.rooms, newRoom] } : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? { ...state.currentProject, rooms: [...state.currentProject.rooms, newRoom] }
              : state.currentProject,
        }));
      },

      updateRoom: (projectId, roomId, updates) => {
        set((state) => {
          const updatedProjects = state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              rooms: p.rooms.map((r) => (r.id === roomId ? { ...r, ...updates } : r)),
            };
          });
          const updatedCurrent =
            state.currentProject?.id === projectId
              ? {
                  ...state.currentProject,
                  rooms: state.currentProject.rooms.map((r) =>
                    r.id === roomId ? { ...r, ...updates } : r
                  ),
                }
              : state.currentProject;
          return { projects: updatedProjects, currentProject: updatedCurrent };
        });
      },

      removeRoom: (projectId, roomId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, rooms: p.rooms.filter((r) => r.id !== roomId) } : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? { ...state.currentProject, rooms: state.currentProject.rooms.filter((r) => r.id !== roomId) }
              : state.currentProject,
        }));
      },

      addProjectAsset: (projectId, asset) => {
        const newAsset: ProjectAsset = {
          id: `a-${Date.now()}`,
          ...asset,
          createdAt: new Date().toISOString()
        };
        set((state) => {
          const updatedProjects = state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const currentAssets = p.assets || [];
            return { ...p, assets: [...currentAssets, newAsset] };
          });
          const updatedCurrent = state.currentProject?.id === projectId
            ? { ...state.currentProject, assets: [...(state.currentProject.assets || []), newAsset] }
            : state.currentProject;
          return { projects: updatedProjects, currentProject: updatedCurrent };
        });
      },

      renameProjectAsset: (projectId, assetId, newName) => {
        set((state) => {
          const updatedProjects = state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedAssets = (p.assets || []).map((a) =>
              a.id === assetId ? { ...a, name: newName } : a
            );
            return { ...p, assets: updatedAssets };
          });
          const updatedCurrent = state.currentProject?.id === projectId
            ? {
                ...state.currentProject,
                assets: (state.currentProject.assets || []).map((a) =>
                  a.id === assetId ? { ...a, name: newName } : a
                )
              }
            : state.currentProject;
          return { projects: updatedProjects, currentProject: updatedCurrent };
        });
      },

      deleteProjectAsset: (projectId, assetId) => {
        set((state) => {
          const updatedProjects = state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const updatedAssets = (p.assets || []).filter((a) => a.id !== assetId);
            return { ...p, assets: updatedAssets };
          });
          const updatedCurrent = state.currentProject?.id === projectId
            ? {
                ...state.currentProject,
                assets: (state.currentProject.assets || []).filter((a) => a.id !== assetId)
              }
            : state.currentProject;
          return { projects: updatedProjects, currentProject: updatedCurrent };
        });
      },
    }),
    { name: "project-storage" }
  )
);
