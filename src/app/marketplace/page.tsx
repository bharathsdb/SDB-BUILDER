"use client";

import * as React from "react";
import { Search, MapPin, Star, Check, X, SlidersHorizontal, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Card, Badge, Input } from "@/components/ui";
import { useMarketplaceStore } from "@/lib/stores/marketplace-store";
import { useUIStore } from "@/lib/stores/ui-store";

const typeColors: Record<string, "info" | "success" | "warning" | "default"> = {
  architect: "info",
  designer: "success",
  engineer: "warning",
  builder: "default",
};

export default function MarketplacePage() {
  const { listings, filters, setFilter, contactProfessional } = useMarketplaceStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");
  const [contactModal, setContactModal] = React.useState<string | null>(null);
  const [contactMsg, setContactMsg] = React.useState("");

  const filtered = listings.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.type !== "all" && l.type !== filters.type) return false;
    if (filters.location !== "all" && !l.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minRating > 0 && l.rating < filters.minRating) return false;
    return true;
  });

  const handleContact = async (id: string) => {
    await contactProfessional(id, contactMsg);
    addToast("Message sent successfully!", "success");
    setContactModal(null);
    setContactMsg("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Marketplace</h1>
        <p className="text-slate-500">Find and connect with architecture professionals worldwide.</p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search professionals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filters</h3>
                <button onClick={() => { setFilter("type", "all"); setFilter("location", "all"); setFilter("minRating", 0); }} className="text-xs text-primary hover:underline">Reset</button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Professional Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilter("type", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="architect">Architects</option>
                  <option value="designer">Designers</option>
                  <option value="engineer">Engineers</option>
                  <option value="builder">Builders</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location === "all" ? "" : filters.location}
                  onChange={(e) => setFilter("location", e.target.value || "all")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <div className="flex gap-1">
                  {[0, 3, 3.5, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilter("minRating", r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        filters.minRating === r
                          ? "bg-primary text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-lg text-xs font-medium"
                  >
                    <Check className="w-3 h-3" /> Available
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-medium">
                    <X className="w-3 h-3" /> Not Available
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <Card>
              <div className="p-12 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">No Professionals Found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-2xl glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-zinc-800 relative flex items-center justify-center">
                    <div className="text-4xl font-bold text-slate-300 dark:text-slate-700 opacity-50">
                      {listing.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant={typeColors[listing.type]}>{listing.type}</Badge>
                    </div>
                    {!listing.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="default">Not Available</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">{listing.name}</h3>
                    <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {listing.location}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{listing.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold">{listing.rating}</span>
                        <span className="text-xs text-slate-500">({listing.reviews} reviews)</span>
                      </div>
                      <p className="text-sm font-bold">${listing.price}<span className="text-xs text-slate-500 font-normal">/hr</span></p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/marketplace/${listing.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <ArrowUpRight className="w-3 h-3" /> View Profile
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!listing.available}
                        onClick={() => setContactModal(listing.id)}
                      >
                        Contact
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {contactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setContactModal(null); setContactMsg(""); }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6"
          >
            <h2 className="text-lg font-bold mb-4">Contact Professional</h2>
            <div className="space-y-4">
              <textarea
                rows={4}
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder="Write your message..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
              />
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => handleContact(contactModal)}>Send Message</Button>
                <Button variant="secondary" className="flex-1" onClick={() => { setContactModal(null); setContactMsg(""); }}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
