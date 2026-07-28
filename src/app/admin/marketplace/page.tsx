"use client";

import * as React from "react";
import { Search, ShoppingBag, Star, Eye, Check, X, DollarSign, TrendingUp, Shield, Ban } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { mockMarketplace } from "@/lib/api/mock-db";
import { useUIStore } from "@/lib/stores/ui-store";

const approvalStatus: Record<string, "success" | "warning" | "danger" | "default"> = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
};

const initialListings = mockMarketplace.map((l, i) => ({
  ...l,
  approval: i < 3 ? "approved" as const : i < 5 ? "pending" as const : "rejected" as const,
  featured: i < 1,
  earnings: Math.floor(Math.random() * 5000) + 500,
}));

export default function AdminMarketplacePage() {
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [listings, setListings] = React.useState(initialListings);
  const [reviewModal, setReviewModal] = React.useState<string | null>(null);
  const [featureModal, setFeatureModal] = React.useState<string | null>(null);

  const filtered = listings.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && l.approval !== statusFilter) return false;
    return true;
  });

  const totalEarnings = listings.reduce((sum, l) => sum + l.earnings, 0);
  const commission = totalEarnings * 0.15;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Marketplace Admin</h1>
        <p className="text-zinc-400">Manage marketplace listings, reviews, and commissions.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-sm text-zinc-400">Total Listings</p>
          <p className="text-2xl font-bold text-white">{listings.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-400 w-fit mb-3">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-sm text-zinc-400">Approved</p>
          <p className="text-2xl font-bold text-white">{listings.filter((l) => l.approval === "approved").length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-sm text-zinc-400">Total Earnings</p>
          <p className="text-2xl font-bold text-white">${totalEarnings.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm text-zinc-400">Commission (15%)</p>
          <p className="text-2xl font-bold text-white">${commission.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-zinc-500"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Listings Table */}
      <Card className="overflow-hidden !bg-zinc-900 !border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 font-semibold text-zinc-400">Professional</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Type</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Rating</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Featured</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Approval</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Earnings</th>
                <th className="text-right p-4 font-semibold text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((listing) => (
                <tr key={listing.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                        {listing.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <span className="font-medium text-white">{listing.name}</span>
                        <p className="text-xs text-zinc-500">{listing.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={listing.type === "architect" ? "info" : listing.type === "designer" ? "success" : listing.type === "engineer" ? "warning" : "default"}>
                      {listing.type}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-white">{listing.rating}</span>
                      <span className="text-zinc-500">({listing.reviews})</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {listing.featured ? (
                      <Badge variant="warning">Featured</Badge>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant={approvalStatus[listing.approval]}>{listing.approval}</Badge>
                  </td>
                  <td className="p-4 font-medium text-white">${listing.earnings.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => addToast("Viewing listing details", "info")}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setReviewModal(listing.id)}>
                        <Shield className="w-4 h-4 text-amber-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setFeatureModal(listing.id)}>
                        <Star className="w-4 h-4 text-amber-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setListings(listings.filter((l) => l.id !== listing.id));
                        addToast("Listing removed", "info");
                      }}>
                        <Ban className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Commission Settings */}
      <Card className="!bg-zinc-900 !border-zinc-800">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Commission Settings</h3>
            <p className="text-sm text-zinc-400 mt-1">Current commission rate: <strong className="text-white">15%</strong></p>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm" defaultValue="15">
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
              <option value="25">25%</option>
            </select>
            <Button onClick={() => addToast("Commission rate updated", "success")}>Update</Button>
          </div>
        </div>
      </Card>

      {/* Review Modal */}
      <Modal isOpen={reviewModal !== null} onClose={() => setReviewModal(null)} title="Review Listing" size="md">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Review and moderate this marketplace listing.</p>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => { addToast("Listing approved", "success"); setReviewModal(null); }}>
              <Check className="w-4 h-4" /> Approve
            </Button>
            <Button variant="danger" className="flex-1" onClick={() => { addToast("Listing rejected", "info"); setReviewModal(null); }}>
              <X className="w-4 h-4" /> Reject
            </Button>
            <Button variant="secondary" onClick={() => setReviewModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Feature Modal */}
      <Modal isOpen={featureModal !== null} onClose={() => setFeatureModal(null)} title="Featured Listing" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Toggle featured status for this listing. Featured listings appear at the top of search results.</p>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => { addToast("Featured status updated", "success"); setFeatureModal(null); }}>Toggle Featured</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setFeatureModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
