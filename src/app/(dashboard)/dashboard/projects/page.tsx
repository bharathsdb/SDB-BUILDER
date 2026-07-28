"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Grid3x3, List, MoreVertical, Eye, Copy, Trash2,
  Wand2, CheckCircle2, Clock, Loader2, Star, Share2, Download,
  Filter, SortAsc, Building2, ArrowRight, Calendar, Users
} from "lucide-react";
import { useProjectStore, type Project } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/lib/utils";
import RenderPreviewModal from "@/components/viewers/RenderPreviewModal";

const statusConfig = {
  completed: { label: "Completed", class: "badge-success", icon: CheckCircle2 },
  generating: { label: "Generating", class: "badge-warning", icon: Loader2 },
  draft: { label: "Draft", class: "badge-info", icon: Clock },
  archived: { label: "Archived", class: "badge-primary", icon: Clock },
};

const styleColors: Record<string, string> = {
  Modern: "from-blue-400 to-cyan-400",
  Contemporary: "from-violet-400 to-purple-400",
  Scandinavian: "from-emerald-400 to-teal-400",
  Mediterranean: "from-orange-400 to-amber-400",
  Farmhouse: "from-amber-400 to-yellow-400",
  Luxury: "from-pink-400 to-rose-400",
};

export default function ProjectsPage() {
  const { projects, duplicateProject, deleteProject, generatePlan } = useProjectStore();
  const { addToast } = useUIStore();
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [filterStyle, setFilterStyle] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("updated");
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [generatingId, setGeneratingId] = React.useState<string | null>(null);
  const [previewProject, setPreviewProject] = React.useState<Project | null>(null);

  const filtered = React.useMemo(() => {
    let list = [...projects];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
    if (filterStatus !== "all") list = list.filter(p => p.status === filterStatus);
    if (filterStyle !== "all") list = list.filter(p => p.style === filterStyle);
    if (sortBy === "updated") list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "created") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [projects, search, filterStatus, filterStyle, sortBy]);

  const handleDuplicate = async (id: string) => {
    const dup = await duplicateProject(id);
    if (dup) addToast(`"${dup.name}" created!`, "success");
    setOpenMenu(null);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    addToast("Project deleted.", "info");
    setDeleteTarget(null);
  };

  const handleGenerate = async (id: string) => {
    setGeneratingId(id);
    await generatePlan(id);
    setGeneratingId(null);
    addToast("Floor plan generated!", "success");
  };

  const styles = ["all", ...Array.from(new Set(projects.map(p => p.style)))];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{projects.length} projects in your workspace</p>
        </div>
        <Link href="/generate" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 transition-all text-sm">
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="generating">Generating</option>
        </select>
        <select
          value={filterStyle} onChange={e => setFilterStyle(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {styles.map(s => <option key={s} value={s}>{s === "all" ? "All Styles" : s}</option>)}
        </select>
        <select
          value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="updated">Last Modified</option>
          <option value="created">Date Created</option>
          <option value="name">Name A-Z</option>
        </select>
        <div className="flex bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <button onClick={() => setView("grid")} className={cn("p-2 transition-colors", view === "grid" ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={cn("p-2 transition-colors", view === "list" ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Grid/List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-slate-400 text-sm mb-6">Try adjusting your filters or create a new project.</p>
          <Link href="/generate" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm">
            <Plus className="w-4 h-4" /> Create Project
          </Link>
        </div>
      ) : view === "grid" ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project, i) => {
            const sc = statusConfig[project.status];
            const gradKey = Object.keys(styleColors).find(k => project.style.includes(k)) || "Modern";
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-xl hover:border-primary/30 transition-all duration-200 hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className={`aspect-video relative bg-gradient-to-br ${styleColors[gradKey] || "from-blue-400 to-cyan-400"} overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/20 font-black text-8xl">{project.name.charAt(0)}</div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.preventDefault(); setPreviewProject(project); }}
                      className="px-2.5 py-1.5 bg-white text-slate-900 rounded-lg font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Quick Preview
                    </button>
                    <Link href={`/dashboard/projects/${project.id}`} className="px-2.5 py-1.5 bg-white/20 text-white rounded-lg font-semibold text-xs hover:bg-white/30 transition-colors backdrop-blur-sm">
                      Details
                    </Link>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm", sc.class)}>{sc.label}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="relative">
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === project.id ? null : project.id); }}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/40 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {openMenu === project.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -5 }}
                            className="absolute top-8 right-0 w-44 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1 z-20"
                          >
                            <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" onClick={() => setOpenMenu(null)}>
                              <Eye className="w-4 h-4 text-slate-400" /> View Details
                            </Link>
                            <Link href="/workspace/2d" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" onClick={() => setOpenMenu(null)}>
                              <Building2 className="w-4 h-4 text-slate-400" /> Open Editor
                            </Link>
                            {project.status === "draft" && (
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" onClick={() => { handleGenerate(project.id); setOpenMenu(null); }}>
                                <Wand2 className="w-4 h-4 text-primary" /> Generate Plan
                              </button>
                            )}
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" onClick={() => handleDuplicate(project.id)}>
                              <Copy className="w-4 h-4 text-slate-400" /> Duplicate
                            </button>
                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-danger" onClick={() => { setDeleteTarget(project.id); setOpenMenu(null); }}>
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {generatingId === project.id && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm font-medium">Generating plan...</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Card body */}
                <div className="p-4">
                  <h3 className="font-bold mb-1 truncate">{project.name}</h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-1">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.plotLength > 0 && <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">{project.plotLength}x{project.plotWidth}ft</span>}
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">{project.floors}F</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">{project.style}</span>
                    {project.vastu && <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-md">Vastu ✓</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                    <div className="flex gap-1">
                      {project.costEstimate && (
                        <Link href="/analysis/cost" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-primary" title="Cost estimate">
                          <IndianRupee className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      {project.shared && (
                        <Link href="/dashboard/sharing" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-primary" title="Share">
                          <Share2 className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Project</span><span>Status</span><span>Style</span><span>Updated</span><span>Actions</span>
          </div>
          {filtered.map(project => {
            const sc = statusConfig[project.status];
            return (
              <div key={project.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${styleColors[project.style] || "from-blue-400 to-cyan-400"} shrink-0`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{project.name}</p>
                    <p className="text-xs text-slate-400 truncate">{project.rooms.length} rooms · {project.floors} floor{project.floors > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", sc.class)}>{sc.label}</span>
                <span className="text-sm text-slate-500">{project.style}</span>
                <span className="text-xs text-slate-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPreviewProject(project)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors cursor-pointer"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link href={`/dashboard/projects/${project.id}`} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors" title="View Details">
                    <Building2 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDuplicate(project.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(project.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-danger transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete Project"
        description="This action cannot be undone. All project data, rooms, and cost estimates will be permanently removed."
        confirmLabel="Delete Project"
        variant="danger"
      />

      {/* Click outside to close menu */}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}

      {/* Dynamic Render Preview Modal for Projects */}
      {previewProject && (
        <RenderPreviewModal
          roomLayoutData={previewProject.rooms.map(r => ({
            name: r.name,
            width: r.width,
            length: r.length,
            level: r.level,
            area: r.area,
          }))}
          onClose={() => setPreviewProject(null)}
        />
      )}
    </div>
  );
}

function IndianRupee({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12M6 8h12M12 3v18M9 13l3 6 3-6M7 8a5 5 0 0 0 5 5"/></svg>;
}
