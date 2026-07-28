"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ArrowRight, CheckCircle2, Clock, Loader2, Layers, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";
import { mockProjects, type Project } from "@/lib/api/mock-db";

const allStyles = Array.from(new Set(mockProjects.filter((p) => p.style).map((p) => p.style)));
const allStatuses = Array.from(new Set(mockProjects.map((p) => p.status)));

const styleMap: Record<string, string> = {
  Modern: "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  Contemporary: "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  Scandinavian: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  Mediterranean: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
};

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "info" | "default" }> = {
  completed: { label: "Completed", variant: "success" },
  draft: { label: "Draft", variant: "warning" },
  generating: { label: "Generating", variant: "info" },
};

export default function GalleryPage() {
  const [search, setSearch] = React.useState("");
  const [activeStyle, setActiveStyle] = React.useState<string | null>(null);
  const [activeStatus, setActiveStatus] = React.useState<string | null>(null);

  const filtered = mockProjects.filter((p) => {
    if (activeStyle && p.style !== activeStyle) return false;
    if (activeStatus && p.status !== activeStatus) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="info" className="mb-4">Gallery</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Project Gallery</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Browse our complete collection of AI-generated architectural designs.
              </p>
            </motion.div>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="max-w-md">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-500 mr-1">Style:</span>
              <button
                onClick={() => setActiveStyle(null)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  !activeStyle
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                All
              </button>
              {allStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => setActiveStyle(style)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    activeStyle === style
                      ? "bg-primary text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {style}
                </button>
              ))}
              <span className="text-sm font-medium text-slate-500 ml-4 mr-1">Status:</span>
              <button
                onClick={() => setActiveStatus(null)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  !activeStatus
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                All
              </button>
              {allStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    activeStatus === status
                      ? "bg-primary text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-slate-500 mb-4">
            Showing {filtered.length} of {mockProjects.length} projects
          </p>

          {/* Masonry-like grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 mb-12">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="break-inside-avoid mb-6"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-500 mb-2">No projects found</h3>
              <p className="text-slate-400 mb-4">Try adjusting your search or filter criteria.</p>
              <Button variant="secondary" onClick={() => { setSearch(""); setActiveStyle(null); setActiveStatus(null); }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const status = statusConfig[project.status] || statusConfig.draft;
  const statusIcon = project.status === "completed" ? <CheckCircle2 className="w-3.5 h-3.5" />
    : project.status === "generating" ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
    : <Clock className="w-3.5 h-3.5" />;

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all hover:border-primary/30">
      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Home className="w-16 h-16 opacity-20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="flex gap-2 w-full">
            <Link href={`/gallery/${project.id}`} className="flex-1">
              <Button size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
        {project.status === "generating" && (
          <div className="absolute top-3 right-3">
            <Badge variant="info">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Generating
            </Badge>
          </div>
        )}
      </div>
      <CardContent>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold">{project.name}</h3>
          {project.status === "completed" && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.plotLength > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
              {project.plotLength}&times;{project.plotWidth}
            </span>
          )}
          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
            {project.floors} Fl
          </span>
          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
            {project.rooms.length} Rms
          </span>
          {project.style && (
            <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded", styleMap[project.style] || "")}>
              {project.style}
            </span>
          )}
          <Badge variant={status.variant} className="text-[10px]">
            {statusIcon}
            <span className="ml-0.5">{status.label}</span>
          </Badge>
        </div>
        {project.costEstimate && (
          <div className="text-xs text-slate-500">
            <span className="font-medium">${project.costEstimate.total.toLocaleString()}</span> estimated
          </div>
        )}
      </CardContent>
    </Card>
  );
}
