"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ExternalLink, Eye, Download, Share2, Ruler,
  Compass, Layers, Square, Tag, DollarSign, Home, Building2
} from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GalleryViewer from "@/components/viewers/GalleryViewer";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const { addToast } = useUIStore();
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => { fetchProjects().then(() => setInitialized(true)); }, []);

  const project = projects.find((p) => p.id === params.id);

  if (!initialized || isLoading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-6xl mx-auto text-center py-20">
        <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project not found</h2>
        <p className="text-slate-500 mb-6">The project you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
        <Link href="/dashboard/projects">
          <Button>
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const statusVariant = project.status === "completed" ? "success" : project.status === "generating" ? "warning" : "default";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects" className="p-2 text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <Badge variant={statusVariant}>{project.status}</Badge>
          </div>
          <p className="text-slate-500">{project.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/workspace/2d?project=${project.id}`}>
          <Button>
            <ExternalLink className="w-4 h-4" />
            Open in Editor
          </Button>
        </Link>
        <Link href={`/workspace/3d?project=${project.id}`}>
          <Button variant="secondary">
            <Eye className="w-4 h-4" />
            View 3D
          </Button>
        </Link>
        <Button variant="secondary" onClick={() => addToast("PDF export started", "success")}>
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
        <Button variant="secondary" onClick={() => addToast("Share link copied!", "info")}>
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold">Project Gallery & Media Assets</h2>
            </CardHeader>
            <CardContent>
              <GalleryViewer projectId={project.id} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold">Project Details</h2>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Ruler className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Dimensions</p>
                      <p className="font-medium text-sm">{project.plotLength} x {project.plotWidth} ft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10 text-success">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Facing Direction</p>
                      <p className="font-medium text-sm">{project.facing}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10 text-warning">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Floors</p>
                      <p className="font-medium text-sm">{project.floors}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-info/10 text-primary">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Style</p>
                      <p className="font-medium text-sm">{project.style}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Square className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Budget Tier</p>
                      <p className="font-medium text-sm">{project.budgetTier}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-info/10 text-primary">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Vastu Compliant</p>
                      <p className="font-medium text-sm">{project.vastu ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.rooms.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold">Rooms ({project.rooms.length})</h2>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {project.rooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-medium text-sm">{room.name}</p>
                          <p className="text-xs text-slate-500">Level {room.level}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{room.width} x {room.length} ft</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.materials.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold">Materials</h2>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {project.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <p className="font-medium text-sm">{material.name}</p>
                        <p className="text-xs text-slate-500">{material.type}</p>
                      </div>
                      <span className="text-sm font-medium">${material.cost}/{material.unit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {project.costEstimate && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold">Cost Estimate</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(project.costEstimate).map(([key, value]) => {
                    if (key === "total") return null;
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 capitalize">{key}</span>
                        <span className="font-medium">${value.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-lg">${project.costEstimate.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold">Timeline</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Created</span>
                    <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Updated</span>
                    <span className="font-medium">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
