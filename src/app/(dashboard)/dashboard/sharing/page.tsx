"use client";

import * as React from "react";
import { Link, Copy, Clock, Globe, Users, Check, X, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Input, Modal } from "@/components/ui";
import { useUIStore } from "@/lib/stores/ui-store";

const sharedProjects = [
  { id: 1, name: "Modern Duplex 30x40", sharedWith: "sarah@example.com", access: "Can edit", status: "Active", date: "2 days ago", views: 12 },
  { id: 2, name: "Luxury Villa Design", sharedWith: "mike@example.com", access: "View only", status: "Active", date: "1 week ago", views: 8 },
  { id: 3, name: "Scandinavian Apartment", sharedWith: "emily@example.com", access: "Can comment", status: "Expired", date: "2 weeks ago", views: 24 },
  { id: 4, name: "Compact Urban Duplex", sharedWith: "alex@example.com", access: "Can edit", status: "Active", date: "3 weeks ago", views: 5 },
];

export default function SharingPage() {
  const { addToast } = useUIStore();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [generatedLink, setGeneratedLink] = React.useState("");
  const [permission, setPermission] = React.useState("view");
  const [expiry, setExpiry] = React.useState("7");
  const [copied, setCopied] = React.useState(false);

  const handleGenerateLink = () => {
    const link = `https://plancraftai.com/shared/${Math.random().toString(36).substring(2, 10)}`;
    setGeneratedLink(link);
    addToast("Share link generated!", "success");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      addToast("Link copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const accessColors: Record<string, "info" | "success" | "warning"> = {
    "View only": "info",
    "Can edit": "success",
    "Can comment": "warning",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Project Sharing</h1>
          <p className="text-slate-500">Create shareable links and manage access to your projects.</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Link className="w-4 h-4" /> Create Share Link
        </Button>
      </div>

      {/* Shared Projects List */}
      <Card>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold">Shared Projects ({sharedProjects.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left p-4 font-semibold text-slate-500">Project</th>
                <th className="text-left p-4 font-semibold text-slate-500">Shared With</th>
                <th className="text-left p-4 font-semibold text-slate-500">Access Level</th>
                <th className="text-left p-4 font-semibold text-slate-500">Status</th>
                <th className="text-left p-4 font-semibold text-slate-500">Date</th>
                <th className="text-left p-4 font-semibold text-slate-500">Views</th>
              </tr>
            </thead>
            <tbody>
              {sharedProjects.map((project) => (
                <tr key={project.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                  <td className="p-4 font-medium">{project.name}</td>
                  <td className="p-4 text-slate-500">{project.sharedWith}</td>
                  <td className="p-4">
                    <Badge variant={accessColors[project.access]}>{project.access}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={project.status === "Active" ? "success" : "default"}>{project.status}</Badge>
                  </td>
                  <td className="p-4 text-slate-500">{project.date}</td>
                  <td className="p-4 text-slate-500">{project.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* How Sharing Works */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: Link, title: "Generate Link", desc: "Create a unique shareable link for any project" },
          { icon: Globe, title: "Set Permissions", desc: "Control who can view, edit, or comment" },
          { icon: Clock, title: "Expiry Control", desc: "Set expiration dates for time-limited access" },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Create Share Link Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setGeneratedLink(""); }} title="Create Share Link" size="md">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Project</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm">
              <option>Modern Duplex 30x40</option>
              <option>Luxury Villa Design</option>
              <option>Scandinavian Apartment</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Permission Level</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "view", label: "View only", desc: "Read-only access" },
                { value: "edit", label: "Can edit", desc: "Full editing rights" },
                { value: "comment", label: "Can comment", desc: "Can leave feedback" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPermission(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    permission === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry</label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="never">Never expires</option>
            </select>
          </div>

          {!generatedLink ? (
            <Button className="w-full" onClick={handleGenerateLink}>
              <Link className="w-4 h-4" /> Generate Share Link
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="flex-1 bg-transparent text-sm font-mono focus:outline-none"
                />
                <Button size="sm" variant="secondary" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Anyone with this link can {permission === "view" ? "view" : permission === "edit" ? "edit" : "comment on"} your project
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
