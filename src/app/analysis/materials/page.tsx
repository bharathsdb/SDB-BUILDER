"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft, Hexagon, Calculator, Scale, TrendingUp,
  ShoppingCart, Check, AlertTriangle, BarChart3
} from "lucide-react";
import { useProjectStore } from "@/lib/stores/project-store";
import { useUIStore } from "@/lib/stores/ui-store";

type QualityGrade = "Economy" | "Standard" | "Premium";

interface MaterialQty {
  name: string; icon: string; unit: string; baseQty: number;
  costs: Record<QualityGrade, number>;
}

const materials: MaterialQty[] = [
  { name: "Bricks", icon: "🧱", unit: "nos", baseQty: 25000, costs: { Economy: 6, Standard: 9, Premium: 14 } },
  { name: "Cement", icon: "🏗️", unit: "bags", baseQty: 450, costs: { Economy: 320, Standard: 380, Premium: 450 } },
  { name: "Steel", icon: "🔩", unit: "tons", baseQty: 8, costs: { Economy: 55000, Standard: 62000, Premium: 75000 } },
  { name: "Sand", icon: "⏳", unit: "cu.ft", baseQty: 1500, costs: { Economy: 35, Standard: 45, Premium: 60 } },
  { name: "Aggregate", icon: "🪨", unit: "cu.ft", baseQty: 1200, costs: { Economy: 40, Standard: 50, Premium: 65 } },
];

const suppliers = [
  { name: "BuildMart", rating: 4.5, delivery: "3-5 days", Economy: 0.9, Standard: 1.0, Premium: 1.05 },
  { name: "ConstroPro", rating: 4.2, delivery: "2-4 days", Economy: 0.95, Standard: 1.02, Premium: 1.08 },
  { name: "MaterialHub", rating: 4.7, delivery: "4-6 days", Economy: 0.85, Standard: 0.98, Premium: 1.02 },
  { name: "EcoBuild", rating: 4.4, delivery: "5-7 days", Economy: 1.0, Standard: 1.05, Premium: 1.12 },
];

export default function MaterialsAnalysisPage() {
  const { currentProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [grade, setGrade] = React.useState<QualityGrade>("Standard");
  const [selectedSupplier, setSelectedSupplier] = React.useState(0);

  const plotArea = currentProject ? (currentProject.plotLength * currentProject.plotWidth) || 1200 : 1200;
  const scaleFactor = plotArea / 1200;

  const totalCost = materials.reduce((sum, m) => {
    return sum + m.baseQty * scaleFactor * m.costs[grade] * suppliers[selectedSupplier][grade];
  }, 0);

  const savings = materials.reduce((sum, m) => {
    const standardCost = m.baseQty * scaleFactor * m.costs.Standard;
    const currentCost = m.baseQty * scaleFactor * m.costs[grade] * suppliers[selectedSupplier][grade];
    return sum + (currentCost - standardCost);
  }, 0);

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-zinc-950 overflow-hidden select-none">
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">Material Analysis</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => addToast("Material order placed!", "success")} className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium shadow-sm transition-colors">
            <ShoppingCart className="w-3.5 h-3.5" /> Order Materials
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Quality Grade Selector */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Material Quality Grade</h3>
            <div className="flex gap-3">
              {(["Economy", "Standard", "Premium"] as QualityGrade[]).map(g => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                    grade === g
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold">{g}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {g === "Economy" ? "Budget-friendly" : g === "Standard" ? "Balanced quality" : "Premium grade"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Material Quantities */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" /> Quantity Estimates
            </h3>
            <div className="space-y-4">
              {materials.map(mat => {
                const qty = Math.round(mat.baseQty * scaleFactor);
                const cost = qty * mat.costs[grade];
                return (
                  <div key={mat.name} className="flex items-center gap-4">
                    <span className="text-2xl">{mat.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{mat.name}</span>
                        <span className="text-xs text-slate-500">{qty.toLocaleString()} {mat.unit}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(qty / 30000) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-mono w-24 text-right">${(cost * suppliers[selectedSupplier][grade]).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplier Comparison */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Supplier Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-2 font-medium text-slate-500">Supplier</th>
                    <th className="text-center py-2 font-medium text-slate-500">Rating</th>
                    <th className="text-center py-2 font-medium text-slate-500">Delivery</th>
                    <th className="text-center py-2 font-medium text-slate-500">{grade} Price Factor</th>
                    <th className="text-center py-2 font-medium text-slate-500">Select</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier, i) => (
                    <tr key={supplier.name} className="border-b border-slate-100 dark:border-slate-800/50">
                      <td className="py-3 font-medium">{supplier.name}</td>
                      <td className="text-center py-3">{'⭐'.repeat(Math.round(supplier.rating - 3))} {supplier.rating}</td>
                      <td className="text-center py-3 text-slate-500">{supplier.delivery}</td>
                      <td className="text-center py-3 font-mono">{(supplier[grade] * 100).toFixed(0)}%</td>
                      <td className="text-center py-3">
                        <button
                          onClick={() => setSelectedSupplier(i)}
                          className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                            selectedSupplier === i
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {selectedSupplier === i ? <Check className="w-3 h-3 inline" /> : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Optimization */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Cost Optimization
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400">Total Estimated Cost</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">${totalCost.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-600 dark:text-amber-400">vs Standard</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {savings >= 0 ? '+' : ''}${Math.round(savings).toLocaleString()}
                </p>
              </div>
            </div>
            {grade === "Economy" && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Economy grade may result in higher maintenance costs over time
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
