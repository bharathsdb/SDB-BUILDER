"use client";

import * as React from "react";
import { CreditCard, TrendingUp, TrendingDown, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { useUIStore } from "@/lib/stores/ui-store";

const planBreakdown = [
  { plan: "Free", users: 2749, percent: 60, revenue: "$0", color: "bg-zinc-600" },
  { plan: "Pro", users: 1375, percent: 30, revenue: "$39,875", color: "bg-primary" },
  { plan: "Enterprise", users: 458, percent: 10, revenue: "$45,342", color: "bg-purple-500" },
];

const recentChanges = [
  { user: "Emily Davis", from: "Free", to: "Pro", date: "2 hours ago", type: "upgrade" },
  { user: "Alex Kumar", from: "Pro", to: "Enterprise", date: "Yesterday", type: "upgrade" },
  { user: "Mike Johnson", from: "Pro", to: "Free", date: "3 days ago", type: "downgrade" },
  { user: "Sarah Chen", from: "Enterprise", to: "Pro", date: "1 week ago", type: "downgrade" },
  { user: "John Doe", from: "Free", to: "Pro", date: "1 week ago", type: "upgrade" },
  { user: "Ar. Priya Sharma", from: "Pro", to: "Enterprise", date: "2 weeks ago", type: "upgrade" },
];

export default function AdminSubscriptionsPage() {
  const { addToast } = useUIStore();
  const [changeModal, setChangeModal] = React.useState<{ user: string; action: string } | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Subscription Management</h1>
        <p className="text-zinc-400">Manage user subscriptions and plans.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">Active Subscriptions</p>
          <h3 className="text-3xl font-bold text-white">1,833</h3>
          <p className="text-xs text-green-400 flex items-center gap-1 mt-2"><TrendingUp className="w-3 h-3" /> +5.2% this month</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-3 rounded-xl bg-green-500/10 text-green-400 w-fit mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">Churn Rate</p>
          <h3 className="text-3xl font-bold text-white">2.4%</h3>
          <p className="text-xs text-green-400 flex items-center gap-1 mt-2"><TrendingDown className="w-3 h-3" /> -0.3% improvement</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">MRR Growth</p>
          <h3 className="text-3xl font-bold text-white">+4.7%</h3>
          <p className="text-xs text-green-400 flex items-center gap-1 mt-2"><TrendingUp className="w-3 h-3" /> $2,450 new MRR</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm text-zinc-400 mb-1">Free Users</p>
          <h3 className="text-3xl font-bold text-white">2,749</h3>
          <p className="text-xs text-amber-400 flex items-center gap-1 mt-2">60% of total users</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Plan Breakdown */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h3 className="font-bold text-white mb-1">Users by Plan</h3>
          <p className="text-sm text-zinc-400 mb-6">Distribution across all plans</p>
          <div className="space-y-6">
            {planBreakdown.map((plan) => (
              <div key={plan.plan}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{plan.plan}</span>
                    <Badge variant={plan.plan === "Free" ? "default" : plan.plan === "Pro" ? "info" : "success"}>{plan.percent}%</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{plan.users.toLocaleString()} users</p>
                    <p className="text-xs text-zinc-500">{plan.revenue}</p>
                  </div>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${plan.percent}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`h-full rounded-full ${plan.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Changes */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h3 className="font-bold text-white mb-1">Recent Subscription Changes</h3>
          <p className="text-sm text-zinc-400 mb-6">Upgrade and downgrade activity</p>
          <div className="space-y-3">
            {recentChanges.map((change, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${change.type === "upgrade" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    {change.type === "upgrade" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{change.user}</p>
                    <p className="text-xs text-zinc-500">
                      {change.from} <span className="text-zinc-600">&rarr;</span> {change.to}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">{change.date}</span>
                  <Badge variant={change.type === "upgrade" ? "success" : "warning"}>{change.type}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setChangeModal({ user: change.user, action: change.type === "upgrade" ? "downgrade" : "upgrade" })}
                  >
                    {change.type === "upgrade" ? "Downgrade" : "Upgrade"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Plan Actions</h2>
        <Card className="!bg-zinc-900 !border-zinc-800">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50">
              <div>
                <h4 className="font-semibold text-white">Bulk Upgrade to Pro</h4>
                <p className="text-sm text-zinc-400">Upgrade all free users to Pro plan for a trial period</p>
              </div>
              <Button onClick={() => addToast("Bulk upgrade initiated for 2,749 users", "success")}>Upgrade All</Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50">
              <div>
                <h4 className="font-semibold text-white">Apply Enterprise Discount</h4>
                <p className="text-sm text-zinc-400">Set 15% annual discount for Enterprise plan users</p>
              </div>
              <Button variant="secondary" onClick={() => addToast("Enterprise discount applied", "success")}>Apply Discount</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Change Modal */}
      <Modal isOpen={changeModal !== null} onClose={() => setChangeModal(null)} title="Change Subscription" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Are you sure you want to {changeModal?.action} <strong className="text-white">{changeModal?.user}</strong>?</p>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => { addToast(`User ${changeModal?.action} successful`, "success"); setChangeModal(null); }}>Confirm</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setChangeModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
