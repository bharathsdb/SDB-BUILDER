"use client";

import * as React from "react";
import { CreditCard, Download, FileText, Plus, Receipt, Calendar, HardDrive, Users, Wand2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { useUIStore } from "@/lib/stores/ui-store";
import { useBillingStore } from "@/lib/stores/billing-store";
import { SUBSCRIPTION_PLANS } from "@/lib/config/subscriptions";
import Link from "next/link";

export default function BillingPage() {
  const { addToast } = useUIStore();
  const {
    currentPlan,
    transactions,
    aiCreditsUsed,
    aiCreditsTotal,
    storageUsedMb,
    storageQuotaMb,
    fetchBillingData,
    downloadInvoice,
    isLoading
  } = useBillingStore();

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);

  React.useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const activePlanDetails = SUBSCRIPTION_PLANS[currentPlan] || SUBSCRIPTION_PLANS.free;

  // Formatting date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Convert storage from MB to GB
  const storageUsedGb = (storageUsedMb / 1024).toFixed(2);
  const storageQuotaGb = (storageQuotaMb / 1024).toFixed(1);

  // Percent calculation
  const creditsPercent = Math.min(100, Math.round((aiCreditsUsed / aiCreditsTotal) * 100)) || 0;
  const storagePercent = Math.min(100, Math.round((storageUsedMb / storageQuotaMb) * 100)) || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Subscriptions</h1>
          <p className="text-slate-500">Manage your subscription plans, monitor usage quotas, and print GST tax invoices.</p>
        </div>
        <Link href="/dashboard/subscription">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Compare Plans
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Current Plan */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden relative">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <Badge variant={currentPlan === "free" ? "secondary" : "success"} className="mb-2">
                    {currentPlan === "free" ? "Free Tier" : "Active Premium Plan"}
                  </Badge>
                  <h2 className="text-2xl font-extrabold mt-1">{activePlanDetails.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {currentPlan === "free"
                      ? "Basic 2D layouts and standard resolution exports"
                      : "Access to advanced 12-stage AI generator & boundary cv vision pipeline"}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    ₹{activePlanDetails.priceMonthly.toLocaleString("en-IN")}
                    <span className="text-sm text-slate-400 font-normal">/month</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Includes 18% GST ready billing</p>
                </div>
              </div>

              {currentPlan !== "free" && (
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-xl flex items-start gap-2.5 text-xs text-slate-500 border border-slate-100 dark:border-slate-800">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    Your subscription will renew automatically. You can print invoice receipts for your business tax returns below.
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment History & GST Invoices */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-slate-500" />
              Tax Invoices & Transaction History
            </h2>
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center text-slate-500">Loading payment records...</div>
              ) : transactions.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-4">
                  <FileText className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
                  <p className="font-medium text-sm">No transactions recorded yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Once you purchase a premium plan using Paytm, your GST tax invoices will show up here.
                  </p>
                  <Link href="/dashboard/subscription" className="inline-block mt-2">
                    <Button variant="outline" size="sm">Go to Plans</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/80">
                        <th className="p-4 font-semibold text-slate-500">Invoice ID / Order</th>
                        <th className="p-4 font-semibold text-slate-500">Plan Purchased</th>
                        <th className="p-4 font-semibold text-slate-500">Date</th>
                        <th className="p-4 font-semibold text-slate-500">Amount (Incl. GST)</th>
                        <th className="p-4 font-semibold text-slate-500">Status</th>
                        <th className="p-4 text-right font-semibold text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/25 dark:hover:bg-zinc-900/25">
                          <td className="p-4">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{tx.orderId}</span>
                            {tx.txnId && <div className="text-[10px] text-slate-400 font-mono mt-0.5">Txn ID: {tx.txnId}</div>}
                          </td>
                          <td className="p-4 capitalize font-semibold">{tx.planName} Plan</td>
                          <td className="p-4 text-slate-500">{formatDate(tx.createdAt)}</td>
                          <td className="p-4 font-bold text-slate-700 dark:text-slate-300">₹{tx.amount.toLocaleString("en-IN")}</td>
                          <td className="p-4">
                            <Badge variant={tx.status === "SUCCESS" ? "success" : tx.status === "PENDING" ? "warning" : "danger"}>
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            {tx.status === "SUCCESS" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => downloadInvoice(tx.orderId)}
                                title="Download GST Invoice"
                              >
                                <Download className="w-4 h-4 text-primary" />
                              </Button>
                            ) : (
                              <span className="text-[10px] text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Usage Summary */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md">
            <div className="p-6">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Resource Quotas</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Wand2 className="w-3.5 h-3.5" /> AI Generation Credits
                    </span>
                    <span className="font-semibold">{aiCreditsUsed} / {aiCreditsTotal}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${creditsPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" /> Project Cloud Storage
                    </span>
                    <span className="font-semibold">{storageUsedGb} / {storageQuotaGb} GB</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Secure Payment details */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Paytm Secure Checkout</h4>
                <p className="text-xs text-slate-500">
                  Transactions are secured by Paytm Gateway 256-bit encryption. We do not store card PINs or passwords.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
