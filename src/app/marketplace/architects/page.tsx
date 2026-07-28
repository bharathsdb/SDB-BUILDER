"use client";

import * as React from "react";
import { Search, MapPin, Star, ArrowUpRight, Award, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Card, Badge, Input } from "@/components/ui";
import { useMarketplaceStore } from "@/lib/stores/marketplace-store";
import { useUIStore } from "@/lib/stores/ui-store";

export default function ArchitectsPage() {
  const { listings, filters, setFilter } = useMarketplaceStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");

  const architects = listings.filter((l) => l.type === "architect");

  const filtered = architects.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.location !== "all" && !l.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minRating > 0 && l.rating < filters.minRating) return false;
    return true;
  });

  const featured = architects.filter((a) => a.rating >= 4.8);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Architects Marketplace</h1>
          <p className="text-slate-500">Connect with top architectural designers worldwide.</p>
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
          placeholder="Search architects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      {/* Featured Architects */}
      {featured.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Featured Architects
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featured.map((architect, i) => (
              <motion.div
                key={architect.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl glass-card dark:glass-card-dark border-2 border-amber-200 dark:border-amber-800 overflow-hidden"
              >
                <div className="absolute top-3 right-3">
                  <Badge variant="warning">Featured</Badge>
                </div>
                <div className="flex p-6 gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-200/20 flex items-center justify-center text-3xl font-bold text-primary shrink-0">
                    {architect.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{architect.name}</h3>
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {architect.location}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{architect.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-bold">{architect.rating}</span>
                        <span className="text-xs text-slate-500">({architect.reviews} reviews)</span>
                      </div>
                      <p className="font-bold">${architect.price}<span className="text-xs text-slate-500 font-normal">/hr</span></p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link href={`/marketplace/${architect.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">View Profile</Button>
                      </Link>
                      <Button size="sm" className="flex-1" onClick={() => addToast(`Contact request sent to ${architect.name}`, "success")}>
                        Hire Now
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Architects */}
      <div>
        <h2 className="text-lg font-bold mb-4">All Architects</h2>
        {filtered.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No Architects Found</h3>
              <p className="text-sm text-slate-500">Try adjusting your search terms.</p>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((architect, i) => (
              <motion.div
                key={architect.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all overflow-hidden"
              >
                <div className="aspect-[4/3] bg-slate-100 dark:bg-zinc-800 relative flex items-center justify-center">
                  <div className="text-4xl font-bold text-slate-300 dark:text-slate-700 opacity-50">
                    {architect.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <Badge variant="info" className="absolute top-3 left-3">Architect</Badge>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{architect.name}</h3>
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> {architect.location}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{architect.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold">{architect.rating}</span>
                      <span className="text-xs text-slate-500">({architect.reviews})</span>
                    </div>
                    <p className="font-bold">${architect.price}<span className="text-xs text-slate-500 font-normal">/hr</span></p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/marketplace/${architect.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">View Profile</Button>
                    </Link>
                    <Button size="sm" className="flex-1" onClick={() => addToast(`Contact request sent to ${architect.name}`, "success")}>
                      Hire Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
