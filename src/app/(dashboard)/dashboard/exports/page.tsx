"use client";

import * as React from "react";
import { Download, FileText, Image as ImageIcon, Box, Layout, Clock } from "lucide-react";

export default function ExportCenterPage() {
  const exports = [
    { type: "PDF", name: "Architectural_Blueprint_v2.pdf", date: "Today, 10:45 AM", size: "4.2 MB", icon: FileText, color: "text-red-500 bg-red-50 dark:bg-red-500/10" },
    { type: "PNG", name: "3D_Render_Front_View.png", date: "Yesterday, 2:30 PM", size: "8.1 MB", icon: ImageIcon, color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" },
    { type: "DXF", name: "AutoCAD_Layout_Final.dxf", date: "Oct 12, 09:15 AM", size: "1.5 MB", icon: Layout, color: "text-green-500 bg-green-50 dark:bg-green-500/10" },
    { type: "GLTF", name: "3D_Model_Optimized.glb", date: "Oct 10, 04:20 PM", size: "15.4 MB", icon: Box, color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Export Center</h1>
        <p className="text-slate-500">Generate and download professional assets for your projects.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {[
          { title: "2D Blueprints", desc: "PDF with exact dimensions", icon: FileText },
          { title: "HD Renders", desc: "4K PNG/JPG images", icon: ImageIcon },
          { title: "CAD Files", desc: "DWG/DXF for engineers", icon: Layout },
          { title: "3D Models", desc: "GLTF/OBJ for AR/VR", icon: Box },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 hover:border-primary/50 cursor-pointer transition-colors group text-center">
            <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500 mb-4">{item.desc}</p>
            <button className="text-sm font-semibold text-primary">Generate</button>
          </div>
        ))}
      </div>

      <div className="glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">Recent Exports</h2>
          <button className="text-sm font-medium text-slate-500 hover:text-foreground transition-colors">View All</button>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {exports.map((file, i) => (
            <div key={i} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${file.color}`}>
                  <file.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base">{file.name}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {file.date}</span>
                    <span>•</span>
                    <span>{file.size}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-foreground">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
