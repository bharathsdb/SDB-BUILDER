"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown, ChevronRight, FileText, Home, Box, Eye, IndianRupee, Download, Code, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: FileText,
    content: [
      "Create an account and verify your email to get started with PlanCraftAI.",
      "Navigate to the Generate page and enter your plot dimensions (length, width, and area).",
      "Select your preferred architectural style from available templates (Modern, Traditional, Contemporary).",
      "Review the AI-generated floor plan and use the editing tools to customize rooms, doors, and windows.",
    ],
  },
  {
    id: "floor-plans",
    title: "Floor Plans",
    icon: Home,
    content: [
      "Generate 2D floor plans by specifying room count, layout preferences, and total square footage.",
      "Drag and drop rooms to rearrange the layout. Resize rooms by clicking and dragging edges.",
      "Add annotations, dimensions, and labels to your floor plan for construction-ready blueprints.",
      "Export floor plans as PNG, SVG, or PDF with customizable scale and resolution settings.",
    ],
  },
  {
    id: "3d-viewing",
    title: "3D Viewing",
    icon: Box,
    content: [
      "Toggle between 2D and 3D views to visualize your floor plan as a realistic 3D model.",
      "Orbit, pan, and zoom using mouse controls. Use the compass widget to orient the view.",
      "Apply different materials and textures to walls, floors, and roofs in real-time.",
      "Enable walkthrough mode to navigate the interior of your design from a first-person perspective.",
    ],
  },
  {
    id: "vastu-analysis",
    title: "Vastu Analysis",
    icon: Eye,
    content: [
      "Automatic Vastu compliance check for your floor plan based on directional alignments.",
      "Get detailed reports on room placements, entrance directions, and zone compatibility.",
      "Receive actionable suggestions to improve Vastu compliance without compromising design.",
      "Support for multiple Vastu traditions including North Indian and South Indian interpretations.",
    ],
  },
  {
    id: "cost-estimation",
    title: "Cost Estimation",
    icon: IndianRupee,
    content: [
      "Receive instant cost estimates based on your floor plan dimensions, materials, and location.",
      "Break down costs by category: Foundation, Structure, Finishing, Electrical, Plumbing, and Labor.",
      "Compare material options (economy, standard, premium) to see how choices affect the budget.",
      "Export cost reports as spreadsheets for sharing with contractors and stakeholders.",
    ],
  },
  {
    id: "exporting",
    title: "Exporting",
    icon: Download,
    content: [
      "Export your designs in multiple formats: PDF, PNG, SVG, DWG, and IFC for BIM compatibility.",
      "Batch export multiple floor plans at once with consistent settings and naming conventions.",
      "Share designs via a public or password-protected link with customizable expiration dates.",
      "Integrate with cloud storage services (Google Drive, Dropbox, OneDrive) for automatic backups.",
    ],
  },
  {
    id: "api",
    title: "API",
    icon: Code,
    content: [
      "RESTful API endpoints for programmatic floor plan generation and management.",
      "Authentication via API keys with role-based access control for teams and enterprises.",
      "Webhook support for real-time notifications on generation completion and export readiness.",
      "Rate limiting at 1000 requests/hour for standard plans and 10000 requests/hour for enterprise.",
    ],
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = React.useState("getting-started");
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    "getting-started": true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentSection = sections.find((s) => s.id === activeSection)!;

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Documentation</h1>
          </div>

          <div className="flex gap-8 lg:gap-12">
            {/* Sidebar */}
            <aside className="hidden md:block w-64 shrink-0">
              <nav className="sticky top-28 space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/25"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {section.title}
                    </button>
                  );
                })}
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    href="/api-docs"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    API Reference
                  </Link>
                </div>
              </nav>
            </aside>

            {/* Mobile section selector */}
            <div className="md:hidden w-full mb-6">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                        isActive
                          ? "bg-primary text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {section.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Collapsible sections */}
                <div className="space-y-4">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSections[section.id] || false;
                    return (
                      <div key={section.id} className="glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold">{section.title}</h2>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-5">
                            <ul className="space-y-3">
                              {section.content.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-lg">Need more help?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Check our API reference or contact our support team.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/api-docs">
                      <Button variant="secondary">API Reference</Button>
                    </Link>
                    <Link href="/contact">
                      <Button>Contact Support</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
