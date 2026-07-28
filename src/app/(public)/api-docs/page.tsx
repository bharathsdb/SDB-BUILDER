"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code, BookOpen, ArrowLeft, ChevronRight, Copy, Check, Server, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Badge } from "@/components/ui";

const endpoints = [
  {
    method: "GET",
    path: "/api/projects",
    description: "Retrieve all projects for the authenticated user. Supports pagination, filtering, and sorting.",
    auth: "API Key",
    request: `curl -X GET "https://api.plancraftai.com/v1/projects?page=1&limit=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "data": [
    {
      "id": "proj_123",
      "name": "Modern Villa",
      "status": "completed",
      "dimensions": { "length": 40, "width": 30 },
      "created_at": "2025-06-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}`,
  },
  {
    method: "POST",
    path: "/api/generate",
    description: "Generate a new floor plan based on provided parameters. Returns a job ID for tracking generation progress.",
    auth: "API Key",
    request: `curl -X POST "https://api.plancraftai.com/v1/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "length": 40,
    "width": 30,
    "floors": 2,
    "style": "modern",
    "rooms": ["living", "kitchen", "bedroom", "bathroom"]
  }'`,
    response: `{
  "job_id": "gen_456",
  "status": "queued",
  "estimated_time_seconds": 45,
  "created_at": "2025-06-01T11:00:00Z"
}`,
  },
  {
    method: "GET",
    path: "/api/vastu",
    description: "Analyze a floor plan for Vastu compliance. Returns detailed scores for each Vastu principle.",
    auth: "API Key",
    request: `curl -X GET "https://api.plancraftai.com/v1/vastu/proj_123" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "project_id": "proj_123",
  "overall_score": 87,
  "categories": {
    "entrance": { "score": 92, "status": "compliant" },
    "room_placement": { "score": 78, "status": "partial" },
    "directions": { "score": 95, "status": "compliant" },
    "zones": { "score": 82, "status": "compliant" }
  },
  "suggestions": [
    {
      "type": "improvement",
      "message": "Consider moving the master bedroom to the southwest corner."
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/export",
    description: "Export a project in the specified format. Formats supported: pdf, png, svg, dwg, ifc.",
    auth: "API Key",
    request: `curl -X POST "https://api.plancraftai.com/v1/export" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": "proj_123",
    "format": "pdf",
    "options": {
      "scale": "1:100",
      "include_dimensions": true,
      "color_scheme": "blueprint"
    }
  }'`,
    response: `{
  "export_id": "exp_789",
  "status": "processing",
  "download_url": null,
  "estimated_size_mb": 2.5,
  "expires_at": "2025-06-02T11:00:00Z"
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
  POST: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  PUT: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
  DELETE: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
};

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Docs
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">API Reference</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
              Build and integrate PlanCraftAI into your workflow with our RESTful API. 
              All endpoints require authentication via API key.
            </p>
          </div>

          {/* Auth notice */}
          <div className="flex items-start gap-4 p-4 mb-8 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Key className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Authentication</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                All API requests require an API key passed via the <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">Authorization</code> header. 
                Generate your API key from the Dashboard Settings page.
              </p>
            </div>
          </div>

          {/* Base URL */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Base URL</h2>
            <div className="flex items-center gap-2 p-3 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-xl">
              <code className="text-sm font-mono text-primary">https://api.plancraftai.com/v1</code>
              <button
                onClick={() => copyToClipboard("https://api.plancraftai.com/v1", -1)}
                className="ml-auto p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Endpoints */}
          <div className="space-y-6">
            {endpoints.map((ep, idx) => {
              const isCopied = copiedIndex === idx * 2;
              const isCopiedResp = copiedIndex === idx * 2 + 1;
              return (
                <motion.div
                  key={ep.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
                >
                  {/* Endpoint header */}
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn("px-2.5 py-0.5 rounded-md text-xs font-bold font-mono", methodColors[ep.method])}>
                        {ep.method}
                      </span>
                      <code className="text-sm font-mono font-semibold">{ep.path}</code>
                      <Badge variant="info">{ep.auth}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{ep.description}</p>
                  </div>

                  {/* Request */}
                  <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Request Example</h4>
                      <button
                        onClick={() => copyToClipboard(ep.request, idx * 2)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-success" />
                            <span className="text-success">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 dark:bg-black text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                      <code>{ep.request}</code>
                    </pre>
                  </div>

                  {/* Response */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Response Example</h4>
                      <button
                        onClick={() => copyToClipboard(ep.response, idx * 2 + 1)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
                      >
                        {isCopiedResp ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-success" />
                            <span className="text-success">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 dark:bg-black text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                      <code>{ep.response}</code>
                    </pre>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div>
              <h3 className="font-bold text-lg">Explore the docs</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Learn more about our features and capabilities.
              </p>
            </div>
            <Link href="/docs">
              <Button variant="secondary">
                <BookOpen className="w-4 h-4" />
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
