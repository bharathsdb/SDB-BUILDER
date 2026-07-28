"use client";

import * as React from "react";
import {
  Sparkles, Send, History, Wand2, ScanEye, DollarSign,
  LayoutGrid, Lightbulb, Clock, MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useAIStore } from "@/lib/stores/ai-store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const suggestedPrompts = [
  { icon: Wand2, label: "Generate 3BHK modern villa on 40x60 plot", prompt: "Generate a 3BHK modern villa on 40x60 plot with open floor plan" },
  { icon: ScanEye, label: "Optimize Vastu for east-facing plot", prompt: "Optimize Vastu for east-facing plot with 3 bedrooms" },
  { icon: DollarSign, label: "Cost estimate for standard finish", prompt: "Generate cost estimate for standard finish 2000 sqft home" },
  { icon: LayoutGrid, label: "3 variations of duplex layout", prompt: "Generate 3 variations of duplex layout" },
  { icon: Lightbulb, label: "Furnish living room Scandinavian", prompt: "Furnish living room in Scandinavian style" },
];

const typeVariant: Record<string, "info" | "success" | "warning" | "default"> = {
  "floor-plan": "info",
  vastu: "success",
  cost: "warning",
  interior: "default",
  variation: "info",
};

export default function AIPage() {
  const { isGenerating, progress, history, currentPrompt, setPrompt, generatePlan } = useAIStore();
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);

  const handleGenerate = async (prompt?: string) => {
    const p = prompt || input;
    if (!p.trim() || isGenerating) return;
    setInput("");
    setResult(null);
    const res = await generatePlan(p);
    setResult(res);
  };

  const handleSuggested = (prompt: string) => {
    setInput(prompt);
    handleGenerate(prompt);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Generation Center
        </h1>
        <p className="text-slate-500 text-sm mt-1">Generate floor plans, optimize Vastu, estimate costs, and more.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                placeholder="Describe the plan you want to generate..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm min-h-[80px] resize-none"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              />
            </div>
            <Button onClick={() => handleGenerate()} isLoading={isGenerating} className="self-end">
              <Send className="w-4 h-4" />
              Generate
            </Button>
          </div>

          {isGenerating && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500">Generating...</span>
                <span className="font-medium text-primary">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {result && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-success/10 border border-success/20"
            >
              <p className="text-sm text-success font-medium">{result}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-warning" />
          Suggested Prompts
        </h2>
        <div className="flex flex-wrap gap-3">
          {suggestedPrompts.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSuggested(item.prompt)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <item.icon className="w-4 h-4 text-primary" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5" />
            Generation History
          </h2>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No generations yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item.id}
              >
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{item.prompt}</p>
                          <Badge variant={typeVariant[item.type] || "default"}>{item.type}</Badge>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">{item.result}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
