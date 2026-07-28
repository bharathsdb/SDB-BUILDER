"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge } from "@/components/ui";

const plans = [
  {
    name: "Free",
    price: { monthly: "$0", yearly: "$0" },
    desc: "Perfect for trying out the platform and experimenting with basic designs.",
    features: [
      "3 AI Generations per month",
      "Basic 2D Editor",
      "Watermarked PDF Export",
      "Standard Support",
    ],
    missing: [
      "Unlimited Generations",
      "Advanced 3D Viewer",
      "Vastu & Cost Estimates",
      "HD PDF & PNG Exports",
      "Interior Design AI",
      "DXF/DWG CAD Exports",
      "Team Collaboration",
      "Custom API Access",
    ],
    cta: "Get Started",
    href: "/generate",
  },
  {
    name: "Pro",
    price: { monthly: "$29", yearly: "$290" },
    desc: "For individual architects, designers, and homeowners who need professional tools.",
    featured: true,
    features: [
      "Unlimited AI Generations",
      "Advanced 3D Viewer with VR",
      "Vastu & Cost Estimates",
      "HD PDF & PNG Exports",
      "Interior Design AI",
      "Style Library Access",
    ],
    missing: [
      "DXF/DWG CAD Exports",
      "Team Collaboration",
      "Custom API Access",
      "Priority Support",
    ],
    cta: "Get Started",
    href: "/generate",
  },
  {
    name: "Enterprise",
    price: { monthly: "$99", yearly: "$990" },
    desc: "For professional firms, builders, and teams who need advanced capabilities.",
    features: [
      "Everything in Pro",
      "DXF/DWG CAD Exports",
      "Figma-like Collaboration",
      "Custom API Access",
      "Priority Support",
      "SSO & Team Management",
      "White-Labeling Options",
      "Dedicated Account Manager",
    ],
    missing: [],
    cta: "Contact Sales",
    href: "/enterprise",
  },
];

const comparisonRows = [
  { label: "AI Generations", free: "3/mo", pro: "Unlimited", enterprise: "Unlimited" },
  { label: "2D Floor Plan Editor", free: "Basic", pro: "Advanced", enterprise: "Advanced" },
  { label: "3D Viewer", free: false, pro: true, enterprise: true },
  { label: "VR Mode", free: false, pro: true, enterprise: true },
  { label: "Vastu Compliance", free: false, pro: true, enterprise: true },
  { label: "Cost Estimation", free: false, pro: true, enterprise: true },
  { label: "Interior Design AI", free: false, pro: true, enterprise: true },
  { label: "PDF Export", free: "Watermarked", pro: "HD", enterprise: "HD" },
  { label: "PNG Export", free: "Watermarked", pro: "HD", enterprise: "HD" },
  { label: "CAD/DXF Export", free: false, pro: false, enterprise: true },
  { label: "Team Collaboration", free: false, pro: false, enterprise: true },
  { label: "API Access", free: false, pro: false, enterprise: true },
  { label: "SSO", free: false, pro: false, enterprise: true },
  { label: "Priority Support", free: false, pro: false, enterprise: true },
  { label: "Dedicated Manager", free: false, pro: false, enterprise: true },
];

export default function PricingPage() {
  const [yearly, setYearly] = React.useState(false);

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="info" className="mb-4">Pricing</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Choose the perfect plan for your architectural needs. No hidden fees.
              </p>
            </motion.div>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={cn("text-sm font-medium", !yearly ? "text-foreground" : "text-slate-400")}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                yearly ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
              )}
            >
              <div className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform",
                yearly ? "translate-x-8" : "translate-x-1"
              )} />
            </button>
            <span className={cn("text-sm font-medium", yearly ? "text-foreground" : "text-slate-400")}>
              Yearly
              <span className="ml-1 text-xs text-success font-semibold">Save 17%</span>
            </span>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={cn(
                  "relative p-8 rounded-3xl glass-card dark:glass-card-dark border transition-all flex flex-col",
                  plan.featured
                    ? "border-primary shadow-2xl shadow-primary/20 scale-105 z-10"
                    : "border-slate-200 dark:border-slate-800"
                )}
              >
                {plan.featured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-white text-sm font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1">{plan.desc}</p>
                <div className="mb-8">
                  <span className="text-4xl font-bold">{yearly ? plan.price.yearly : plan.price.monthly}</span>
                  <span className="text-slate-500">/{yearly ? "yr" : "mo"}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{feat}</span>
                    </li>
                  ))}
                  {plan.missing.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 opacity-40">
                      <span className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center text-slate-400">—</span>
                      <span className="text-sm text-slate-400">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    variant={plan.featured ? "primary" : "secondary"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Compare Plans in Detail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold">Free</th>
                    <th className="text-center py-3 px-4 font-semibold text-primary">Pro</th>
                    <th className="text-center py-3 px-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 dark:border-slate-900">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{row.label}</td>
                      {(["free", "pro", "enterprise"] as const).map((tier) => (
                        <td key={tier} className="text-center py-3 px-4">
                          {typeof row[tier] === "boolean" ? (
                            row[tier] ? (
                              <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            )
                          ) : (
                            <span className={cn(
                              row[tier] === "Basic" && "text-slate-400",
                              row[tier] === "Advanced" && "font-medium",
                              row[tier] === "HD" && "font-medium text-primary",
                              typeof row[tier] === "string" && row[tier].startsWith("3") && "font-medium",
                            )}>
                              {row[tier] as string}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="text-center">
            <Card className="max-w-xl mx-auto">
              <CardContent className="py-8">
                <HelpCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">Have questions?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Check our FAQ or reach out to our team for answers.</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/faq">
                    <Button variant="secondary">View FAQ</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="ghost">Contact Us</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
