import { create } from "zustand";
import { mockGenerationHistory } from "@/lib/api/mock-db";

interface AIState {
  isGenerating: boolean;
  progress: number;
  currentPrompt: string;
  history: typeof mockGenerationHistory;
  result: string | null;
  generatePlan: (prompt: string) => Promise<string>;
  generateVariations: (prompt: string) => Promise<string[]>;
  optimizeVastu: (projectId: string) => Promise<{ score: number; suggestions: string[] }>;
  estimateCost: (projectId: string) => Promise<Record<string, number>>;
  furnishRoom: (roomType: string, style: string) => Promise<string>;
  setPrompt: (prompt: string) => void;
}

export const useAIStore = create<AIState>((set) => ({
  isGenerating: false,
  progress: 0,
  currentPrompt: "",
  history: mockGenerationHistory,
  result: null,

  setPrompt: (prompt) => set({ currentPrompt: prompt }),

  generatePlan: async (prompt) => {
    set({ isGenerating: true, progress: 0, currentPrompt: prompt });
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200));
      set({ progress: i });
    }
    const result = "Generated floor plan with optimized layout based on your requirements.";
    set((state) => ({
      isGenerating: false,
      progress: 100,
      result,
      history: [{ id: `gh${Date.now()}`, prompt, result, type: "floor-plan", createdAt: new Date().toISOString() }, ...state.history],
    }));
    return result;
  },

  generateVariations: async (prompt) => {
    set({ isGenerating: true, progress: 0 });
    await new Promise((r) => setTimeout(r, 2000));
    const variations = ["Variation A: Open plan layout", "Variation B: Traditional layout", "Variation C: Compact layout"];
    set({ isGenerating: false, progress: 100, result: variations.join("\n") });
    return variations;
  },

  optimizeVastu: async (_projectId) => {
    set({ isGenerating: true });
    await new Promise((r) => setTimeout(r, 1500));
    const result = {
      score: 87,
      suggestions: ["Move master bedroom to southwest corner", "Relocate kitchen to southeast", "Adjust entrance facing east"],
    };
    set({ isGenerating: false, result: JSON.stringify(result) });
    return result;
  },

  estimateCost: async (_projectId) => {
    set({ isGenerating: true });
    await new Promise((r) => setTimeout(r, 1500));
    const costs = { foundation: 45000, concrete: 32000, steel: 28000, brick: 18000, flooring: 35000, plumbing: 15000, electrical: 12000, labor: 40000, total: 225000 };
    set({ isGenerating: false, result: JSON.stringify(costs) });
    return costs;
  },

  furnishRoom: async (roomType, style) => {
    set({ isGenerating: true });
    await new Promise((r) => setTimeout(r, 1500));
    const result = `Room furnished with ${style} style items for ${roomType}`;
    set({ isGenerating: false, result });
    return result;
  },
}));
