"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Home, Users, Briefcase, ArrowRight, CheckCircle2, HardHat, PencilRuler, Key, TrendingUp, Clock, DollarSign, Shield, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge } from "@/components/ui";

const segments = [
  {
    title: "Architects",
    icon: PencilRuler,
    description: "Supercharge your design workflow with AI-powered tools.",
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/20",
    benefits: [
      "Generate initial layouts 10x faster",
      "Export to CAD/DXF for further refinement",
      "Vastu compliance checking built-in",
      "Present 3D walkthroughs to clients",
      "Collaborate with team members in real-time",
    ],
    cta: "Learn More",
    href: "/architects",
  },
  {
    title: "Builders & Contractors",
    icon: HardHat,
    description: "Streamline estimation and project management from day one.",
    color: "text-amber-500 bg-amber-100 dark:bg-amber-900/20",
    benefits: [
      "Accurate material quantity takeoffs",
      "Real-time cost estimation with local pricing",
      "Generate construction-ready blueprints",
      "Team collaboration and task assignment",
      "Material sourcing from marketplace partners",
    ],
    cta: "Learn More",
    href: "/builders",
  },
  {
    title: "Homeowners",
    icon: Home,
    description: "Design your dream home without hiring an architect upfront.",
    color: "text-green-500 bg-green-100 dark:bg-green-900/20",
    benefits: [
      "No architectural experience needed",
      "Visualize your home before building",
      "Get accurate cost estimates upfront",
      "Compare multiple design options",
      "Share designs with builders for quotes",
    ],
    cta: "Start Designing",
    href: "/generate",
  },
  {
    title: "Real Estate Agents",
    icon: Building2,
    description: "Showcase properties with virtual staging and 3D tours.",
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/20",
    benefits: [
      "Create virtual property tours in minutes",
      "AI-powered virtual staging for empty spaces",
      "Generate floor plans for listings",
      "Share interactive 3D walkthroughs",
      "Stand out with professional presentations",
    ],
    cta: "Explore Solutions",
    href: "/enterprise",
  },
];

export default function SolutionsPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="info" className="mb-4">Solutions</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Tailored Solutions for Every Role</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Whether you&apos;re an architect, builder, homeowner, or real estate agent — PlanCraftAI has the tools you need.
              </p>
            </motion.div>
          </div>

          {/* Segments */}
          <div className="space-y-12 mb-16">
            {segments.map((segment, i) => {
              const Icon = segment.icon;
              return (
                <motion.div
                  key={segment.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className={cn("overflow-hidden", i % 2 === 1 && "md:border-primary/20")}>
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className={cn("p-8 md:p-10 flex flex-col justify-center", i % 2 === 1 && "md:order-2")}>
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", segment.color)}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold mb-2">{segment.title}</h2>
                          <p className="text-slate-500 dark:text-slate-400 mb-6">{segment.description}</p>
                          <ul className="space-y-3 mb-6">
                            {segment.benefits.map((benefit) => (
                              <li key={benefit} className="flex items-start gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                <span className="text-slate-600 dark:text-slate-300">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                          <Link href={segment.href}>
                            <Button>
                              {segment.cta}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                        <div className={cn(
                          "bg-slate-50 dark:bg-slate-900/50 p-8 md:p-10 flex items-center justify-center min-h-[250px]",
                          i % 2 === 1 && "md:order-1"
                        )}>
                          <div className="text-center max-w-xs">
                            <Icon className={cn("w-16 h-16 mx-auto mb-4 opacity-20", segment.color.split(" ")[0])} />
                            <p className="text-sm text-slate-400">
                              {segment.title === "Architects" && "Professional-grade tools for architectural firms and independent architects."}
                              {segment.title === "Builders & Contractors" && "End-to-end project management from blueprint to build."}
                              {segment.title === "Homeowners" && "Design your dream home with AI assistance every step of the way."}
                              {segment.title === "Real Estate Agents" && "Impressive visualizations that help close deals faster."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "50K+", label: "Active Users", icon: Users },
              { value: "10K+", label: "Projects Generated", icon: TrendingUp },
              { value: "99.9%", label: "Uptime", icon: Shield },
              { value: "40+", label: "Countries", icon: MessageSquare },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <Card key={stat.label} className="text-center">
                  <CardContent>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <StatIcon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-10">
                <h2 className="text-2xl font-bold mb-2">Not sure which solution fits?</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Talk to our team and we&apos;ll help you find the perfect plan.</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/enterprise">
                    <Button>Enterprise Solutions</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="secondary">Contact Sales</Button>
                  </Link>
                  <Link href="/generate">
                    <Button variant="ghost">Start Free Trial</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
