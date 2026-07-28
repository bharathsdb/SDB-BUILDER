import { create } from "zustand";
import { mockTeamMembers, type TeamMember } from "@/lib/api/mock-db";

interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  inviteLoading: boolean;
  inviteMember: (email: string, role: string) => Promise<void>;
  updateMemberRole: (id: string, role: string) => void;
  removeMember: (id: string) => void;
  setMemberOnline: (id: string, online: boolean) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  members: mockTeamMembers,
  isLoading: false,
  inviteLoading: false,

  inviteMember: async (email, role) => {
    set({ inviteLoading: true });
    await new Promise(r => setTimeout(r, 1200));
    const newMember: TeamMember = {
      id: `tm${Date.now()}`,
      name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role,
      avatar: "",
      online: false,
      lastSeen: "Just invited",
      joinedAt: new Date().toISOString(),
      permissions: role === "Editor" ? ["view", "edit", "comment"] : ["view"],
      projectsAccess: [],
    };
    set(state => ({
      members: [...state.members, newMember],
      inviteLoading: false,
    }));
  },

  updateMemberRole: (id, role) => {
    set(state => ({
      members: state.members.map(m => m.id === id ? { ...m, role } : m),
    }));
  },

  removeMember: (id) => {
    set(state => ({
      members: state.members.filter(m => m.id !== id),
    }));
  },

  setMemberOnline: (id, online) => {
    set(state => ({
      members: state.members.map(m => m.id === id ? { ...m, online } : m),
    }));
  },
}));
