"use client";

import * as React from "react";
import { Check, X, Zap, Building, Users, AlertTriangle, Sparkles, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, Badge, Modal } from "@/components/ui";
import { useUIStore } from "@/lib/stores/ui-store";
import { useBillingStore, type Plan } from "@/lib/stores/billing-store";
import { SUBSCRIPTION_PLANS } from "@/lib/config/subscriptions";

export default function SubscriptionPage() {
  const { addToast } = useUIStore();
  const { currentPlan, upgradePlan, fetchBillingData, upgradeLoading } = useBillingStore();
  
  const [isAnnual, setIsAnnual] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showChangeModal, setShowChangeModal] = React.useState<Plan | null>(null);
  
  // Paytm Simulator State
  const [simulatorData, setSimulatorData] = React.useState<{
    orderId: string;
    txnToken: string;
    amount: number;
    mid: string;
    paytmUrl: string;
  } | null>(null);

  React.useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleSelectPlan = async (planId: Plan) => {
    if (planId === currentPlan) {
      if (planId !== "free") {
        setShowCancelModal(true);
      }
      return;
    }
    
    setShowChangeModal(planId);
  };

  const confirmPlanChange = async () => {
    if (!showChangeModal) return;
    const planId = showChangeModal;
    setShowChangeModal(null);

    const res = await upgradePlan(planId);
    if (res.success) {
      if (planId === "free") {
        addToast("Downgraded to Free Plan.", "info");
        return;
      }

      if (res.isMock) {
        // Launch local mock Paytm simulator
        setSimulatorData({
          orderId: res.orderId!,
          txnToken: res.txnToken!,
          amount: Number(res.amount!),
          mid: res.mid!,
          paytmUrl: res.paytmUrl!,
        });
      } else {
        // Real Paytm redirect
        addToast("Redirecting to Paytm Gateway...", "success");
        // Create form and submit
        const form = document.createElement("form");
        form.method = "POST";
        form.action = `${res.paytmUrl}`;
        form.name = "paytmForm";

        const params = {
          mid: res.mid,
          orderId: res.orderId,
          txnToken: res.txnToken,
        };

        for (const [key, value] of Object.entries(params)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      }
    } else {
      addToast(res.error || "Failed to initiate payment", "error");
    }
  };

  const handleSimulatePayment = async (status: "SUCCESS" | "FAILURE") => {
    if (!simulatorData) return;
    addToast(`Submitting simulated ${status} callback...`, "info");
    
    // Construct mock gateway post data
    const formData = new FormData();
    formData.append("ORDERID", simulatorData.orderId);
    formData.append("TXNID", "TXN_SIM_" + Math.random().toString(36).substr(2, 9).toUpperCase());
    formData.append("TXNAMOUNT", simulatorData.amount.toString());
    formData.append("STATUS", status === "SUCCESS" ? "TXN_SUCCESS" : "TXN_FAILURE");
    formData.append("RESPMSG", status === "SUCCESS" ? "Txn Success (Simulated)" : "Payment Failed in Sandbox");
    formData.append("CHECKSUMHASH", "MOCK_CHECKSUM_" + Math.random().toString(36).substr(2, 9));
    formData.append("GATEWAYNAME", "PAYTM_SANDBOX");
    formData.append("PAYMENTMODE", "UPI");

    // Close simulator
    setSimulatorData(null);

    try {
      // POST to our verify route
      const response = await fetch("/api/payments/paytm/verify", {
        method: "POST",
        body: formData,
      });

      // The verify endpoint returns a 303 redirect. We can read the redirected URL
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        // If not redirected, refresh billing data
        await fetchBillingData();
        addToast(`Payment simulation finished: ${status}`, status === "SUCCESS" ? "success" : "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Failed to simulate payment callback", "error");
    }
  };

  const planComparison = [
    { feature: "AI Generations (Credits/mo)", free: "5", pro: "100", business: "500", enterprise: "2000" },
    { feature: "Projects", free: "3", pro: "50", business: "200", enterprise: "Unlimited" },
    { feature: "Storage Limit", free: "500 MB", pro: "10 GB", enterprise: "50 GB", business: "500 GB" },
    { feature: "12-Stage AI Layout Engine", free: "—", pro: "✓", business: "✓", enterprise: "✓" },
    { feature: "Computer Vision Uploads", free: "—", pro: "✓", business: "✓", enterprise: "✓" },
    { feature: "HD Exports (.glb, PDF)", free: "—", pro: "✓", business: "✓", enterprise: "✓" },
    { feature: "Custom Branding Reports", free: "—", pro: "—", business: "✓", enterprise: "✓" },
    { feature: "SSO & SAML Security", free: "—", pro: "—", enterprise: "—", business: "✓" },
    { feature: "Support Tier", free: "Community", pro: "Priority", business: "Dedicated Representative", enterprise: "24/7 Hotline" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upgrade to PlanCraftAI V2</h1>
        <p className="text-slate-500">Unleash the full 12-stage AI generator and image-to-plan computer vision services.</p>
      </div>

      {/* Annual / Monthly Toggle */}
      <div className="flex items-center justify-center gap-4 bg-slate-50 dark:bg-zinc-900/40 p-2.5 rounded-full w-fit mx-auto border border-slate-200/50 dark:border-slate-800/50">
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${!isAnnual ? "bg-white dark:bg-zinc-800 shadow-sm text-foreground" : "text-slate-500"}`} onClick={() => setIsAnnual(false)}>Monthly</span>
        <span className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${isAnnual ? "bg-white dark:bg-zinc-800 shadow-sm text-foreground" : "text-slate-500"}`} onClick={() => setIsAnnual(true)}>
          Annual
          <Badge variant="success" className="text-[10px] py-0 px-1.5">Save 20%</Badge>
        </span>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.values(SUBSCRIPTION_PLANS).map((plan, i) => {
          const isCurrent = currentPlan === plan.id;
          const price = isAnnual ? Math.round(plan.priceMonthly * 12 * 0.8) : plan.priceMonthly;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 ${
                isCurrent
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 ring-1 ring-primary"
                  : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md"
              }`}
            >
              {plan.id === "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="info" className="flex items-center gap-1"><Sparkles className="w-3 h-3"/> Popular Choice</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-6">
                  <Badge variant="success">Current Plan</Badge>
                </div>
              )}
              
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-3xl font-extrabold">₹{price.toLocaleString("en-IN")}</span>
                    <span className="text-slate-400 text-xs font-normal">{plan.priceMonthly === 0 ? "forever" : (isAnnual ? "/year" : "/mo")}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Includes {plan.credits} AI Credits/mo</p>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

                <ul className="space-y-3 mb-8 text-xs">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-300">{f}</span>
                    </li>
                  ))}
                  {plan.unsupportedFeatures?.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-slate-400 dark:text-slate-600">
                      <X className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="w-full mt-auto"
                variant={isCurrent ? "outline" : (plan.id === "pro" ? "primary" : "secondary")}
                onClick={() => handleSelectPlan(plan.id as Plan)}
                disabled={upgradeLoading}
              >
                {isCurrent ? "Active Plan" : plan.cta}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Plan Comparison Table */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Detailed Plan Comparison</h2>
        <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/80">
                  <th className="p-4 font-semibold text-slate-500">Feature Details</th>
                  <th className="p-4 text-center font-semibold text-slate-500">Free</th>
                  <th className="p-4 text-center font-semibold text-primary">Pro</th>
                  <th className="p-4 text-center font-semibold text-slate-500">Business</th>
                  <th className="p-4 text-center font-semibold text-slate-500">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {planComparison.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50/20 dark:hover:bg-zinc-900/20">
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-200">{row.feature}</td>
                    <td className="p-4 text-center text-slate-500">{row.free}</td>
                    <td className="p-4 text-center text-primary font-semibold">{row.pro}</td>
                    <td className="p-4 text-center text-slate-500">{row.business}</td>
                    <td className="p-4 text-center text-slate-500">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Downgrade Plan" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">Downgrading takes effect immediately.</p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Are you sure you want to downgrade to the Free plan? You will immediately lose your priority rendering, 12-stage AI pipeline outputs, and visual upload vision tool access.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => { upgradePlan("free"); setShowCancelModal(false); addToast("Downgraded to free plan.", "info"); }}>Confirm Downgrade</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowCancelModal(false)}>Keep Active Plan</Button>
          </div>
        </div>
      </Modal>

      {/* Change Plan Modal */}
      <Modal isOpen={showChangeModal !== null} onClose={() => setShowChangeModal(null)} title={`Confirm Plan Upgrade`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You are subscribing to the <strong>{showChangeModal && SUBSCRIPTION_PLANS[showChangeModal]?.name}</strong>. You will be redirected to the secure Paytm checkout.
          </p>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={confirmPlanChange} disabled={upgradeLoading}>
              {upgradeLoading ? "Initializing Paytm..." : "Proceed to Checkout"}
            </Button>
            <Button variant="secondary" onClick={() => setShowChangeModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Paytm Simulator Modal */}
      <Modal isOpen={simulatorData !== null} onClose={() => setSimulatorData(null)} title="Paytm Sandbox Payment Gateway Simulator" size="sm">
        <div className="space-y-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Building className="w-5 h-5" />
              Paytm Developer Sandbox
            </div>
            <p className="text-xs">
              PlanCraftAI V2 is running in development mode. No real money will be charged.
            </p>
          </div>

          <div className="space-y-2 text-sm border-t border-b border-slate-100 dark:border-slate-800 py-4">
            <div className="flex justify-between"><span className="text-slate-500">Merchant Name:</span> <span className="font-semibold">PlanCraftAI Services</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Order ID:</span> <span className="font-mono font-semibold">{simulatorData?.orderId}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Amount Due:</span> <span className="font-extrabold text-blue-600 dark:text-blue-400">₹{simulatorData?.amount.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Txn Token:</span> <span className="font-mono text-xs text-slate-500 truncate max-w-[150px]">{simulatorData?.txnToken}</span></div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500 text-center font-medium">Choose a transaction outcome below to test webhook and redirect callback handlers:</p>
            <div className="grid grid-cols-2 gap-4">
              <Button className="w-full bg-success text-white hover:bg-success/90" onClick={() => handleSimulatePayment("SUCCESS")}>
                Simulate Success
              </Button>
              <Button className="w-full bg-danger text-white hover:bg-danger/90" onClick={() => handleSimulatePayment("FAILURE")}>
                Simulate Failure
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
