"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, Wand2, Home, Map, Layers, IndianRupee, Sparkles, Loader2 } from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";

export default function GenerateWizardPage() {
  const [step, setStep] = React.useState(1);
  const [direction, setDirection] = React.useState(1);
  const { createProject, updateProject } = useProjectStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const [plotLength, setPlotLength] = React.useState(60);
  const [plotWidth, setPlotWidth] = React.useState(40);
  const [facing, setFacing] = React.useState("East");

  const [bedrooms, setBedrooms] = React.useState(3);
  const [bathrooms, setBathrooms] = React.useState(3);
  const [kitchens, setKitchens] = React.useState(1);
  const [livingRooms, setLivingRooms] = React.useState(1);
  const [parking, setParking] = React.useState(2);
  const [floors, setFloors] = React.useState(2);

  const [vastu, setVastu] = React.useState(true);
  const [spaceOptimized, setSpaceOptimized] = React.useState(true);
  const [luxury, setLuxury] = React.useState(false);
  const [modernFlow, setModernFlow] = React.useState(true);

  const [budgetTier, setBudgetTier] = React.useState("Standard");
  const [style, setStyle] = React.useState("Modern");

  const nextStep = () => {
    if (step < 5) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const [generationStep, setGenerationStep] = React.useState<"idle" | "creating" | "generating" | "rendering">("idle");
  const [generationError, setGenerationError] = React.useState<{step: string, message: string} | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep("creating");
    setGenerationError(null);
    
    // Fallback timeout to reset state if generation hangs for > 45s
    const timeoutId = setTimeout(() => {
      setIsGenerating(false);
      setGenerationStep("idle");
      addToast("Generation is taking longer than expected — please try again.", "error");
    }, 45000);

    let createdProject;
    
    // Step 1: Create Project metadata in DB
    try {
      console.log("[1/3] Creating project in DB...");
      createdProject = await createProject({
        name: `${style} ${plotLength}x${plotWidth} Home`,
        description: `A ${bedrooms}-bedroom ${style.toLowerCase()} home on a ${plotLength}x${plotWidth} ${facing}-facing plot.`,
        userId: user?.id || "u1",
        plotLength,
        plotWidth,
        facing,
        floors,
        budgetTier,
        style,
        vastu,
      });
      console.log("Project created with ID:", createdProject.id);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Step 1 failed:", err);
      setGenerationError({ step: "Project Creation", message: err?.message || "Failed to create project" });
      addToast("Failed to create project.", "error");
      setIsGenerating(false);
      setGenerationStep("idle");
      return;
    }

    // Step 2: Generate Kotlin Layout
    let roomLayoutData = [];
    try {
      setGenerationStep("generating");
      console.log(`[2/3] Generating layout via Kotlin engine for project ${createdProject.id}...`);
      
      // MOCK DATA since backend is unavailable
      await new Promise(r => setTimeout(r, 1500)); // Simulate delay
      const mockRooms = [
        { name: "Living Room", width: 20, length: 15, level: 0, x: 0, y: 0, area: 300 },
        { name: "Kitchen", width: 10, length: 15, level: 0, x: 20, y: 0, area: 150 },
        { name: "Bedroom", width: 15, length: 15, level: 0, x: 0, y: 15, area: 225 },
        { name: "Bathroom", width: 8, length: 10, level: 0, x: 15, y: 15, area: 80 }
      ];
      const data = { plan: { rooms: mockRooms } };
      
      console.log("Kotlin Engine Output:", data.plan);
      roomLayoutData = data.plan.rooms.map((r: any, idx: number) => ({
        id: `r_${Date.now()}_${idx}`,
        name: r.name,
        width: r.width,
        length: r.length,
        level: r.level || 0,
        x: r.x || 0,
        y: r.y || 0,
        area: r.area || (r.width * r.length)
      }));
      
      // Update store with the generated mock rooms so 2D viewer sees them
      if (createdProject && createdProject.id) {
        updateProject(createdProject.id, { rooms: roomLayoutData });
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Step 2 failed:", err);
      setGenerationError({ step: "Layout Generation", message: err?.message || "Failed to generate layout via Kotlin engine" });
      addToast("Project created, but layout generation failed.", "error");
      setIsGenerating(false);
      setGenerationStep("idle");
      // Optionally redirect anyway to see the empty project
      window.location.href = `/workspace/2d?project=${createdProject.id}`;
      return;
    }

    // Step 3: Render visuals via DALL-E
    try {
      setGenerationStep("rendering");
      console.log("[3/3] Generating 2D/3D renders via DALL-E...");
      const { generateFloorPlanRenders } = await import('@/lib/api/openai-render');
      // Read API key from localStorage if available, otherwise it will just fail gracefully
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || "" : "";
      const renders = await generateFloorPlanRenders(roomLayoutData, apiKey);
      console.log("Render Output:", renders);
    } catch (err: any) {
      console.error("Step 3 failed (non-fatal):", err);
      // We don't abort here, we still want to show the workspace
      addToast("Layout generated, but rendering visuals failed. You can retry rendering later.", "error");
    }

    clearTimeout(timeoutId);
    setIsGenerating(false);
    setGenerationStep("idle");
    addToast("Generation complete! Loading workspace...", "success");
    window.location.href = `/workspace/2d?project=${createdProject.id}`;
  };

  const variants = {
    initial: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0, transition: { duration: 0.3 } })
  };

  const roomControls: [string, number, React.Dispatch<React.SetStateAction<number>>][] = [
    ["Bedrooms", bedrooms, setBedrooms],
    ["Bathrooms", bathrooms, setBathrooms],
    ["Kitchens", kitchens, setKitchens],
    ["Living Rooms", livingRooms, setLivingRooms],
    ["Parking", parking, setParking],
    ["Floors", floors, setFloors],
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
      <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
        <div className="font-semibold">New Project</div>
        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Mobile Horizontal Stepper */}
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-4 shrink-0 overflow-x-auto">
          <div className="flex items-center min-w-max gap-4 px-2">
            {[
              { num: 1, title: "Plot", icon: Map },
              { num: 2, title: "Rooms", icon: Home },
              { num: 3, title: "Style", icon: Sparkles },
              { num: 4, title: "Budget", icon: IndianRupee },
              { num: 5, title: "Review", icon: Layers },
            ].map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              return (
                <div key={s.num} onClick={() => setStep(s.num)} className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold transition-colors ${
                    isActive ? 'border-primary bg-primary/10 text-primary' :
                    isCompleted ? 'border-primary bg-primary text-white' :
                    'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-slate-500'}`}>{s.title}</span>
                  {s.num !== 5 && <div className="w-4 h-px bg-slate-200 dark:bg-slate-800" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Vertical Sidebar Stepper */}
        <div className="hidden lg:block lg:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-8 shrink-0 overflow-y-auto">
          <h2 className="text-xl font-bold mb-8">Generation Wizard</h2>

          <div className="space-y-6">
            {[
              { num: 1, title: "Plot Details", desc: "Dimensions & facing", icon: Map },
              { num: 2, title: "Requirements", desc: "Rooms & spaces", icon: Home },
              { num: 3, title: "Preferences", desc: "Styles & Vastu", icon: Sparkles },
              { num: 4, title: "Budget", desc: "Cost estimation tier", icon: IndianRupee },
              { num: 5, title: "Review", desc: "Confirm & generate", icon: Layers },
            ].map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              return (
                <div key={s.num} className="flex gap-4 relative">
                  {s.num !== 5 && (
                    <div className={`absolute top-10 bottom-[-24px] left-5 w-0.5 ${isCompleted ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`} />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    isActive ? 'border-primary bg-primary/10 text-primary' :
                    isCompleted ? 'border-primary bg-primary text-white' :
                    'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isActive || isCompleted ? 'text-foreground' : 'text-slate-400'}`}>{s.title}</h3>
                    <p className={`text-sm ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
          <div className="flex-1 max-w-3xl w-full mx-auto p-8 lg:p-12 flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                {step === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Plot Details</h2>
                      <p className="text-slate-500">Let&apos;s start with the physical dimensions of your land.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Plot Length (ft)</label>
                        <input type="number" value={plotLength} onChange={e => setPlotLength(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Plot Width (ft)</label>
                        <input type="number" value={plotWidth} onChange={e => setPlotWidth(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium mb-3 block">Facing Direction (Road Side)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {["North", "East", "South", "West"].map((dir) => (
                          <button key={dir} onClick={() => setFacing(dir)} className={`py-3 rounded-xl border text-sm font-medium transition-colors ${facing === dir ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}>
                            {dir}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Room Requirements</h2>
                      <p className="text-slate-500">What spaces do you need in the house?</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {roomControls.map(([label, val, setVal]) => (
                        <div key={label} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                          <span className="font-medium">{label}</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setVal(Math.max(0, val - 1))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200">-</button>
                            <span className="w-4 text-center font-bold">{val}</span>
                            <button onClick={() => setVal(val + 1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Preferences & Style</h2>
                      <p className="text-slate-500">Tell the AI how to prioritize the layout generation.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { title: "Vastu Compliant", desc: "Strict adherence to Vastu Shastra rules", state: vastu, set: setVastu },
                          { title: "Space Optimized", desc: "Maximize usable carpet area", state: spaceOptimized, set: setSpaceOptimized },
                          { title: "Luxury", desc: "Larger rooms and premium flow", state: luxury, set: setLuxury },
                          { title: "Modern Flow", desc: "Open kitchen and connected living", state: modernFlow, set: setModernFlow },
                        ].map((pref) => (
                          <div key={pref.title} onClick={() => pref.set(!pref.state)} className={`p-4 rounded-xl border cursor-pointer transition-colors ${pref.state ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className={`font-bold ${pref.state ? 'text-primary' : ''}`}>{pref.title}</h3>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${pref.state ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                                {pref.state && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                            <p className="text-sm text-slate-500">{pref.desc}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Architectural Style</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["Modern", "Contemporary", "Scandinavian", "Mediterranean", "Farmhouse", "Minimalist"].map(s => (
                            <button key={s} onClick={() => setStyle(s)} className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${style === s ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Budget Tier</h2>
                      <p className="text-slate-500">Select your construction budget to receive accurate cost estimates.</p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { tier: "Economy", price: "$50-70 / sqft", desc: "Basic materials, standard finishings." },
                        { tier: "Standard", price: "$70-100 / sqft", desc: "Good quality materials, modern finishings." },
                        { tier: "Premium", price: "$100-150 / sqft", desc: "High-end materials, custom carpentry." },
                        { tier: "Ultra Luxury", price: "$150+ / sqft", desc: "Imported marble, smart home, premium everything." },
                      ].map((b) => (
                        <div key={b.tier} onClick={() => setBudgetTier(b.tier)} className={`p-5 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${budgetTier === b.tier ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 bg-white dark:bg-zinc-900'}`}>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className={`font-bold text-lg ${budgetTier === b.tier ? 'text-primary' : ''}`}>{b.tier}</h3>
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{b.price}</span>
                            </div>
                            <p className="text-sm text-slate-500">{b.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${budgetTier === b.tier ? 'border-primary' : 'border-slate-300 dark:border-slate-700'}`}>
                            {budgetTier === b.tier && <div className="w-3 h-3 rounded-full bg-primary" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Review & Generate</h2>
                      <p className="text-slate-500">Review your constraints before the AI starts designing.</p>
                    </div>
                    <div className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Plot Dimensions</p>
                          <p className="font-semibold text-lg">{plotLength}ft × {plotWidth}ft ({plotLength * plotWidth} sqft)</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Facing</p>
                          <p className="font-semibold text-lg">{facing} Facing</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Key Rooms</p>
                          <p className="font-semibold text-lg">{bedrooms} Beds, {bathrooms} Baths</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Budget Tier</p>
                          <p className="font-semibold text-lg">{budgetTier}</p>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-slate-500 mb-3">Active Constraints</p>
                        <div className="flex flex-wrap gap-2">
                          {vastu && <span className="px-3 py-1 bg-success/10 text-success rounded-lg text-sm font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Vastu</span>}
                          {spaceOptimized && <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Space Optimized</span>}
                          {modernFlow && <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Modern Flow</span>}
                          {luxury && <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> Luxury</span>}
                          {style && <span className="px-3 py-1 bg-violet-50 text-violet-600 rounded-lg text-sm font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> {style}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-3 font-semibold rounded-xl transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'glass-card dark:glass-card-dark hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Back
              </button>

              {step < 5 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-105 disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Wand2 className="w-5 h-5" />
                    )}
                    {isGenerating 
                      ? (generationStep === "creating" ? "Creating project..." 
                         : generationStep === "generating" ? "Generating layout..." 
                         : generationStep === "rendering" ? "Rendering visuals..." 
                         : "Generating...")
                      : "Generate Plan"}
                  </button>
                  {generationError && (
                    <p className="text-xs text-red-500 max-w-xs text-right">
                      <span className="font-semibold">{generationError.step} Error:</span> {generationError.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
