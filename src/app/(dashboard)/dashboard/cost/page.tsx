"use client";

import * as React from "react";
import { IndianRupee, TrendingDown, TrendingUp, AlertTriangle, Hammer, PaintBucket, Zap } from "lucide-react";

export default function CostAnalysisPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Cost Analysis & Estimation</h1>
          <p className="text-slate-500">Real-time material and labor cost breakdown based on regional pricing.</p>
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-sm font-medium">
            <option>Modern Duplex 30x40</option>
            <option>Luxury Villa</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-sm font-medium">
            <option>Region: California</option>
            <option>Region: Texas</option>
            <option>Region: New York</option>
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
          <p className="text-primary-100 text-sm font-medium mb-1">Estimated Total Cost</p>
          <h2 className="text-4xl font-bold mb-4">$345,000</h2>
          <div className="flex items-center gap-2 text-sm font-medium bg-white/20 w-fit px-3 py-1 rounded-full">
            <TrendingDown className="w-4 h-4" /> 5% below budget
          </div>
        </div>
        
        <div className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 text-sm font-medium mb-1">Cost Per Sq.Ft</p>
          <h2 className="text-3xl font-bold mb-4">$143.75</h2>
          <p className="text-sm text-slate-500">Based on 2,400 sqft total area</p>
        </div>

        <div className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 text-sm font-medium mb-1">AI Savings Found</p>
          <h2 className="text-3xl font-bold text-success mb-4">$12,400</h2>
          <p className="text-sm text-slate-500">By optimizing plumbing walls</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold">Category Breakdown</h2>
          
          <div className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 space-y-6">
            {[
              { icon: Hammer, name: "Foundation & Framing", cost: "$85,000", percent: 25, color: "bg-blue-500" },
              { icon: PaintBucket, name: "Finishing & Materials", cost: "$120,000", percent: 35, color: "bg-purple-500" },
              { icon: Zap, name: "Electrical & Plumbing", cost: "$65,000", percent: 18, color: "bg-yellow-500" },
            ].map((cat, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      <cat.icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <span className="font-semibold">{cat.name}</span>
                  </div>
                  <span className="font-bold">{cat.cost}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold">AI Recommendations</h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-warning/30 bg-warning/5">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <div>
                  <h4 className="font-semibold text-warning mb-1">Combine Wet Walls</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Aligning the master bath and kitchen plumbing walls can save approximately $3,200 in piping and labor.</p>
                  <button className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Apply Optimization</button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900">
              <h4 className="font-semibold mb-1">Standardize Window Sizes</h4>
              <p className="text-sm text-slate-500 mb-3">You have 7 different window sizes. Reducing this to 3 standard sizes reduces custom fabrication costs by 12%.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
