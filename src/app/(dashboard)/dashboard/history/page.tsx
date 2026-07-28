"use client";

import * as React from "react";
import {
  History, Clock, Trash2, Filter, LayoutGrid, ScanEye,
  DollarSign, Lightbulb, Wand2
} from "lucide-react";
import { motion } from "framer-motion";
import { useAIStore } from "@/lib/stores/ai-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { id: "all", label: "All", icon: Filter },
  { id: "floor-plan", label: "Floor Plans", icon: LayoutGrid },
  { id: "vastu", label: "Vastu", icon: ScanEye },
  { id: "cost", label: "Cost", icon: DollarSign },
  { id: "interior", label: "Interior", icon: Lightbulb },
  { id: "variation", label: "Variations", icon: Wand2 },
];

const typeVariant: Record<string, "info" | "success" | "warning" | "default"> = {
  "floor-plan": "info",
  vastu: "success",
  cost: "warning",
  interior: "default",
  variation: "info",
};

export default function HistoryPage() {
  const { history } = useAIStore();
  const [activeTab, setActiveTab] = React.useState("all");

  const filtered = activeTab === "all" ? history : history.filter((h) => h.type === activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6" />
            Generation History
          </h1>
          <p className="text-slate-500 text-sm mt-1">{history.length} total generations</p>
        </div>
        {history.length > 0 && (
          <Button variant="ghost" className="text-danger">
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-transparent text-slate-500 hover:text-foreground border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No history found</h3>
          <p className="text-slate-500 text-sm">
            {activeTab === "all" ? "No generations yet. Try the AI Assistant to get started." : `No ${activeTab} generations found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              key={item.id}
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={typeVariant[item.type] || "default"}>{item.type}</Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="font-medium text-sm mb-1">{item.prompt}</p>
                      <p className="text-sm text-slate-500">{item.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
