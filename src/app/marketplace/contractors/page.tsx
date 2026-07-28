"use client";

import * as React from "react";
import { Search, MapPin, Star, ArrowUpRight, Briefcase, Wrench, HardHat } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Card, Badge, Input } from "@/components/ui";
import { useMarketplaceStore } from "@/lib/stores/marketplace-store";
import { useUIStore } from "@/lib/stores/ui-store";

export default function ContractorsPage() {
  const { listings, filters, setFilter } = useMarketplaceStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");

  const contractors = listings.filter((l) => l.type === "builder");

  const filtered = contractors.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.location !== "all" && !l.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minRating > 0 && l.rating < filters.minRating) return false;
    return true;
  });

  const specializations = [
    { name: "Residential Construction", icon: Wrench, count: 120 },
    { name: "Commercial Building", icon: Briefcase, count: 85 },
    { name: "Sustainable Building", icon: HardHat, count: 45 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Contractors Marketplace</h1>
          <p className="text-slate-500">Find trusted builders and contractors for your projects.</p>
        </div>
        <Link href="/marketplace">
          <Button variant="secondary">All Professionals</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search contractors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      {/* Specializations */}
      <div className="grid sm:grid-cols-3 gap-6">
        {specializations.map((spec, i) => (
          <motion.div
            key={spec.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 text-center"
          >
            <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <spec.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold mb-1">{spec.name}</h3>
            <p className="text-sm text-slate-500">{spec.count} projects completed</p>
          </motion.div>
        ))}
      </div>

      {/* Contractors Grid */}
      {filtered.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No Contractors Found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search terms.</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((contractor, i) => (
            <motion.div
              key={contractor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all overflow-hidden"
            >
              <div className="aspect-[4/3] bg-slate-100 dark:bg-zinc-800 relative flex items-center justify-center">
                <div className="text-4xl font-bold text-slate-300 dark:text-slate-700 opacity-50">
                  {contractor.name.split(" ").map(n => n[0]).join("")}
                </div>
                <Badge variant="default" className="absolute top-3 left-3">Builder</Badge>
                <div className="absolute top-3 right-3 px-2 py-1 bg-white dark:bg-zinc-900 rounded-lg text-xs font-bold shadow">
                  87 past projects
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{contractor.name}</h3>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {contractor.location}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{contractor.description}</p>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["Residential", "Commercial", "Green Building"].map((spec) => (
                    <span key={spec} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs rounded-md text-slate-600 dark:text-slate-400">{spec}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold">{contractor.rating}</span>
                    <span className="text-xs text-slate-500">({contractor.reviews})</span>
                  </div>
                  <p className="font-bold">${contractor.price}<span className="text-xs text-slate-500 font-normal">/hr</span></p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/marketplace/${contractor.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      <ArrowUpRight className="w-3 h-3" /> View Profile
                    </Button>
                  </Link>
                  <Button size="sm" className="flex-1" onClick={() => addToast(`Quote request sent to ${contractor.name}`, "success")}>
                    Get Quote
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
