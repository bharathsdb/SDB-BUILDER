"use client";

import * as React from "react";
import { Search, FolderKanban, Eye, Trash2, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { mockProjects } from "@/lib/api/mock-db";
import { useUIStore } from "@/lib/stores/ui-store";

const statusVariants: Record<string, "success" | "warning" | "info" | "default"> = {
  completed: "success",
  draft: "default",
  generating: "info",
};

const planVariants: Record<string, "info" | "success" | "default"> = {
  Standard: "default",
  Premium: "info",
  "Ultra Luxury": "success",
};

export default function AdminProjectsPage() {
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [planFilter, setPlanFilter] = React.useState("all");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [projects, setProjects] = React.useState(mockProjects);

  const filtered = projects.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (planFilter !== "all" && p.budgetTier !== planFilter) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    addToast("Project permanently deleted", "info");
    setDeleteId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Project Management</h1>
        <p className="text-zinc-400">View and manage all user projects.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-zinc-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="generating">Generating</option>
        </select>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All Plans</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
          <option value="Ultra Luxury">Ultra Luxury</option>
        </select>
      </div>

      <Card className="overflow-hidden !bg-zinc-900 !border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 font-semibold text-zinc-400">Project Name</th>
                <th className="text-left p-4 font-semibold text-zinc-400">User ID</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Status</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Plan</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Created</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Size</th>
                <th className="text-right p-4 font-semibold text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <FolderKanban className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-white">{project.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400 font-mono text-xs">{project.userId}</td>
                  <td className="p-4"><Badge variant={(statusVariants[project.status] ?? "default") as "success" | "warning" | "info" | "default"}>{project.status}</Badge></td>
                  <td className="p-4"><Badge variant={(planVariants[project.budgetTier] ?? "default") as "info" | "success" | "default"}>{project.budgetTier}</Badge></td>
                  <td className="p-4 text-zinc-400">{project.createdAt}</td>
                  <td className="p-4 text-zinc-400">{project.rooms?.length || 0} rooms</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => addToast("Viewing project details", "info")}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(project.id)}>
                        <Trash2 className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Project" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Are you sure you want to delete this project? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
