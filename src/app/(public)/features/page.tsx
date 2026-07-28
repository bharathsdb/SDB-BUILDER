"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layout, Box, Map, IndianRupee, Home, Layers, Sparkles, ArrowRight, Play, BarChart3, Share2, Palette, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge } from "@/components/ui";

const featureCategories = [
  {
    title: "AI Generation",
    icon: Sparkles,
    description: "Powered by advanced machine learning models trained on thousands of architectural designs.",
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/20",
    features: [
      { name: "Smart Floor Plan Generation", desc: "Generate complete 2D layouts from plot dimensions, room count, and preferences in seconds." },
      { name: "Multi-Variant Output", desc: "Get 3 different layout variations to compare and choose the best design." },
      { name: "Constraint-Aware AI", desc: "Set rules like Vastu compliance, room adjacency, and flow preferences." },
      { name: "Style Transfer", desc: "Apply architectural styles like Modern, Contemporary, Scandinavian, and Mediterranean." },
    ],
  },
  {
    title: "3D Visualization",
    icon: Box,
    description: "Walk through your designs in immersive 3D before breaking ground.",
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/20",
    features: [
      { name: "Real-Time 3D Rendering", desc: "Built on React Three Fiber for smooth, interactive 3D walkthroughs." },
      { name: "Material Preview", desc: "Apply and visualize different materials, textures, and finishes on walls and floors." },
      { name: "Lighting Simulation", desc: "See how natural light moves through your home at different times of day." },
      { name: "VR Mode", desc: "Experience your future home in virtual reality with WebXR support." },
    ],
  },
  {
    title: "Vastu Analysis",
    icon: Map,
    description: "Ensure your design follows ancient Vastu Shastra principles automatically.",
    color: "text-amber-500 bg-amber-100 dark:bg-amber-900/20",
    features: [
      { name: "Auto Vastu Compliance", desc: "AI checks room placement against Vastu guidelines for plot facing direction." },
      { name: "Zone Optimization", desc: "Optimize room positions across the four Vastu zones for maximum harmony." },
      { name: "Vastu Scoring", desc: "Get a detailed Vastu score with specific recommendations for improvement." },
      { name: "Remedies & Adjustments", desc: "Receive suggested remedies and layout adjustments for Vastu defects." },
    ],
  },
  {
    title: "Cost Estimation",
    icon: IndianRupee,
    description: "Real-time construction cost estimates with local material pricing.",
    color: "text-green-500 bg-green-100 dark:bg-green-900/20",
    features: [
      { name: "Detailed Breakdown", desc: "Foundation, concrete, steel, brickwork, flooring, plumbing, electrical, and labor." },
      { name: "Local Pricing", desc: "Material costs calibrated to your region and city for accurate estimates." },
      { name: "Budget Tiers", desc: "Compare Economy, Standard, Premium, and Ultra Luxury finish levels." },
      { name: "Cost Optimization", desc: "AI suggests material and design alternatives to reduce costs." },
    ],
  },
  {
    title: "Interior Design",
    icon: Palette,
    description: "AI-powered interior furnishing and decoration suggestions.",
    color: "text-pink-500 bg-pink-100 dark:bg-pink-900/20",
    features: [
      { name: "Auto Furnishing", desc: "Automatically furnish rooms with appropriate furniture layouts." },
      { name: "Style Library", desc: "Choose from Modern, Scandinavian, Industrial, Bohemian, and Minimalist styles." },
      { name: "Color Palette Generator", desc: "AI suggests complementary color schemes for each room." },
      { name: "Furniture Marketplace", desc: "Browse and purchase furniture that fits your room dimensions." },
    ],
  },
  {
    title: "Export & Share",
    icon: Share2,
    description: "Export professional-grade documents and collaborate with your team.",
    color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/20",
    features: [
      { name: "PDF Export", desc: "Generate beautifully formatted PDF blueprints ready for submission." },
      { name: "CAD/DXF Export", desc: "Download industry-standard CAD files for professional architects." },
      { name: "Team Collaboration", desc: "Invite team members to view, comment, and edit projects." },
      { name: "Cloud Sync", desc: "All projects auto-save and sync across devices in real-time." },
    ],
  },
];

const demoVideos = [
  { title: "AI Floor Plan Generation", duration: "2:34" },
  { title: "3D Walkthrough Experience", duration: "1:58" },
  { title: "Vastu Analysis Demo", duration: "3:12" },
  { title: "Cost Estimation Overview", duration: "2:05" },
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="info" className="mb-4">Features</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Powerful Features for Modern Architecture</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                From AI-powered floor plan generation to immersive 3D walkthroughs — everything you need to design, estimate, and visualize your dream home.
              </p>
            </motion.div>
          </div>

          {/* Demo Videos */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Watch PlanCraftAI in Action</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {demoVideos.map((video, i) => (
                <motion.div
                  key={video.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="group cursor-pointer hover:shadow-xl transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-t-2xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                        <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-zinc-900/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 text-primary ml-0.5" />
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <span className="font-semibold text-sm">{video.title}</span>
                        <span className="text-xs text-slate-500">{video.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Feature Categories */}
          {featureCategories.map((category, i) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="mb-16 last:mb-0"
              >
                <div className="flex items-start gap-6 mb-8">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", category.color)}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{category.title}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{category.description}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {category.features.map((feature) => (
                    <Card key={feature.name} className="hover:border-primary/30 transition-colors">
                      <CardContent>
                        <h3 className="font-bold mb-1">{feature.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* CTA */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-10">
                <h2 className="text-2xl font-bold mb-2">Ready to try these features?</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Start designing your dream home today — no credit card required.</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/generate">
                    <Button size="lg">Get Started Free</Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="secondary" size="lg">View Pricing</Button>
                  </Link>
                  <Link href="/solutions">
                    <Button variant="ghost" size="lg">See Solutions</Button>
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
