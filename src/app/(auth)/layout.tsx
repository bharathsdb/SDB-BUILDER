import * as React from "react";
import Link from "next/link";
import { Hexagon, Sparkles, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Illustration / Marketing */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group w-fit mb-16">
            <div className="relative flex items-center justify-center w-10 h-10 bg-primary rounded-xl text-white shadow-lg">
              <Hexagon className="w-6 h-6 absolute" />
              <Sparkles className="w-3 h-3 absolute top-1.5 right-1.5" />
            </div>
            <span className="font-bold text-xl tracking-tight">PlanCraftAI</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight max-w-md">
            Architectural design, powered by artificial intelligence.
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-md">
            Join thousands of professionals generating intelligent floor plans and 3D models in seconds.
          </p>
          
          <div className="space-y-4">
            {[
              "Generate layouts from simple plot dimensions",
              "Real-time 3D walkthroughs",
              "Vastu compliance and cost estimation",
              "Figma-like live collaboration"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-16">
          <div className="glass-dark p-6 rounded-2xl border border-slate-700 max-w-md">
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(star => <Sparkles key={star} className="w-4 h-4 fill-primary text-primary" />)}
            </div>
            <p className="italic text-slate-300 mb-4">&quot;PlanCraftAI reduced our initial drafting phase from 2 weeks to literally 5 minutes. The Vastu integration is a game-changer for our clients.&quot;</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700" />
              <div>
                <p className="font-semibold text-sm">Ar. Sarah Jenkins</p>
                <p className="text-xs text-slate-400">Principal Architect, BuildTech</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="relative flex items-center justify-center w-10 h-10 bg-primary rounded-xl text-white shadow-lg">
                <Hexagon className="w-6 h-6 absolute" />
                <Sparkles className="w-3 h-3 absolute top-1.5 right-1.5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">PlanCraftAI</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
