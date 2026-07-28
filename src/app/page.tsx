"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Box, Cpu, Hexagon, Home, IndianRupee, Layers, Layout, 
  Map, Sparkles, Star, CheckCircle2, ChevronRight 
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { PublicLayout } from "@/components/layout/PublicLayout";

export default function LandingPage() {
  return (
    <PublicLayout>
    <div className="flex flex-col min-h-screen pt-20 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 lg:pt-32 lg:pb-40 px-4 md:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />
        
        {/* Architectural Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card dark:glass-card-dark text-sm font-medium text-primary mb-6">
                <Sparkles className="w-4 h-4" />
                <span>PlanCraftAI 2.0 is live</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Generate Smart Floor Plans with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI in Seconds</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl">
                Transform simple plot dimensions into intelligent 2D blueprints and realistic 3D house models. Save weeks of architectural design time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/generate" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105">
                  Create Free Plan
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-card dark:glass-card-dark hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground rounded-xl font-semibold transition-all">
                  Watch Demo
                </button>
              </div>
            </motion.div>

            {/* Right Side: 3D Mockup Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative h-[400px] lg:h-[600px] w-full rounded-2xl glass-card dark:glass-card-dark overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50"
            >
              {/* Placeholder for 3D Canvas */}
              <div className="text-center p-8">
                <Box className="w-16 h-16 text-primary/50 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-semibold text-slate-400">Interactive 3D Viewport</h3>
                <p className="text-sm text-slate-500 mt-2">Loading React Three Fiber...</p>
              </div>

              {/* Floating feature cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-8 left-8 glass dark:glass-dark px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl"
              >
                <div className="bg-primary/20 p-2 rounded-lg text-primary"><Cpu className="w-5 h-5" /></div>
                <div className="text-sm font-semibold">AI Generated</div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 right-8 glass dark:glass-dark px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl"
              >
                <div className="bg-success/20 p-2 rounded-lg text-success"><CheckCircle2 className="w-5 h-5" /></div>
                <div className="text-sm font-semibold">Vastu Optimized</div>
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, -8, 0] }} 
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 left-8 -translate-y-1/2 glass dark:glass-dark px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl"
              >
                <div className="bg-warning/20 p-2 rounded-lg text-warning"><IndianRupee className="w-5 h-5" /></div>
                <div className="text-sm font-semibold">Cost Estimated</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to design your dream home</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">PlanCraftAI combines the power of artificial intelligence with professional architectural tools.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Layout />, title: "AI Floor Plan Generation", desc: "Instantly generate 2D layouts based on your plot size and requirements." },
              { icon: <Box />, title: "Interactive 3D Visualization", desc: "Walk through your generated floor plans in stunning real-time 3D." },
              { icon: <Map />, title: "Vastu Intelligence", desc: "Ensure your home complies with ancient Vastu Shastra principles automatically." },
              { icon: <IndianRupee />, title: "Cost Estimation", desc: "Get real-time construction cost estimates based on regional material prices." },
              { icon: <Home />, title: "Interior Design AI", desc: "Auto-furnish rooms with beautiful styles ranging from Modern to Scandinavian." },
              { icon: <Layers />, title: "Export to PDF & CAD", desc: "Export professional blueprints ready for your architect and contractor." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:border-primary/50 group"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Showcase Section */}
      <section id="showcase" className="py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Project Showcase</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">Explore beautiful homes generated by our AI engine.</p>
            </div>
            <Link href="/gallery" className="inline-flex items-center text-primary font-semibold hover:underline mt-4 md:mt-0">
              View full gallery <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Modern Luxury Villa", dim: "40x60 ft", rooms: "5 Beds", floors: "2 Floors", image: "/images/showcase/modern_luxury_villa.png" },
              { name: "Compact Urban Duplex", dim: "30x40 ft", rooms: "3 Beds", floors: "2 Floors", image: "/images/showcase/compact_urban_duplex.png" },
              { name: "Scandinavian Apartment", dim: "1200 sqft", rooms: "2 Beds", floors: "1 Floor", image: "/images/showcase/scandinavian_apartment.png" },
            ].map((project, i) => (
              <div key={i} className="group rounded-2xl overflow-hidden glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800">
                <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  <img src={project.image} alt={project.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <button className="w-full py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
                      View Blueprint
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{project.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300">{project.dim}</span>
                    <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300">{project.rooms}</span>
                    <span className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300">{project.floors}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">Choose the perfect plan for your architectural needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "$0", desc: "Perfect for trying out the platform.", features: ["3 AI Generations", "Basic 2D Editor", "Watermarked PDF Export"] },
              { name: "Pro", price: "$29", desc: "For individual architects and homeowners.", featured: true, features: ["Unlimited Generations", "Advanced 3D Viewer", "Vastu & Cost Estimates", "HD PDF & PNG Exports", "Interior Design AI"] },
              { name: "Enterprise", price: "$99", desc: "For professional firms and builders.", features: ["Everything in Pro", "DXF/DWG CAD Exports", "Figma-like Collaboration", "Custom API Access", "Priority Support"] },
            ].map((plan, i) => (
              <div key={i} className={cn(
                "relative p-8 rounded-3xl glass-card dark:glass-card-dark border transition-all",
                plan.featured ? "border-primary shadow-2xl shadow-primary/20 md:scale-105 z-10" : "border-slate-200 dark:border-slate-800"
              )}>
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-white text-sm font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-500 mb-6">{plan.desc}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
                <button className={cn(
                  "w-full py-3 rounded-xl font-semibold transition-all",
                  plan.featured ? "bg-primary text-white hover:bg-primary/90" : "bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
                )}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
    </PublicLayout>
  );
}
