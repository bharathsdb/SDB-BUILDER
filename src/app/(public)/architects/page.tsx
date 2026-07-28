"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PencilRuler, Users, ArrowRight, CheckCircle2, Star, HeadphonesIcon, Code, ShoppingBag, Award, DollarSign, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";

const benefits = [
  {
    icon: DollarSign,
    title: "Revenue Sharing",
    description: "Earn 30% commission on every referral who subscribes to PlanCraftAI through your unique link.",
    color: "text-green-500 bg-green-100 dark:bg-green-900/20",
  },
  {
    icon: HeadphonesIcon,
    title: "Priority Support",
    description: "Get priority access to our support team with guaranteed 2-hour response time.",
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/20",
  },
  {
    icon: Code,
    title: "API Access",
    description: "Integrate PlanCraftAI's generation capabilities directly into your own design workflow.",
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/20",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace Listing",
    description: "Get featured in our architect marketplace where homeowners find and hire professionals.",
    color: "text-amber-500 bg-amber-100 dark:bg-amber-900/20",
  },
  {
    icon: Award,
    title: "Verified Badge",
    description: "Receive a verified architect badge on your profile to build trust with potential clients.",
    color: "text-pink-500 bg-pink-100 dark:bg-pink-900/20",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your referrals, earnings, and client engagement with real-time analytics.",
    color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/20",
  },
];

const tiers = [
  {
    name: "Associate",
    minReferrals: "0",
    commission: "20%",
    benefits: ["Marketplace profile", "Basic analytics", "Standard support"],
  },
  {
    name: "Professional",
    minReferrals: "5",
    commission: "30%",
    benefits: ["Everything in Associate", "Priority support", "API access", "Featured listing"],
    featured: true,
  },
  {
    name: "Elite",
    minReferrals: "20",
    commission: "40%",
    benefits: ["Everything in Professional", "Dedicated manager", "Co-branded materials", "Early features access"],
  },
];

export default function ArchitectsPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    firm: "",
    license: "",
    experience: "",
    referral: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="info" className="mb-4">Architects Program</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Partner with PlanCraftAI</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Join our architects program and earn revenue while bringing AI-powered design tools to your clients.
              </p>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "500+", label: "Architects", icon: PencilRuler },
              { value: "2K+", label: "Projects Referred", icon: BarChart3 },
              { value: "4.9", label: "Avg. Rating", icon: Star },
              { value: "$50K+", label: "Commissions Paid", icon: DollarSign },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <Card key={stat.label} className="text-center">
                  <CardContent>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <StatIcon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Why Join?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8">Benefits designed to help your practice grow.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Card className="h-full hover:border-primary/30 transition-colors">
                      <CardContent>
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", benefit.color)}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Tiers */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Commission Tiers</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8">The more you refer, the more you earn.</p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={cn(
                    "relative p-6 rounded-2xl glass-card dark:glass-card-dark border transition-all",
                    tier.featured ? "border-primary shadow-xl shadow-primary/20 scale-105" : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                      Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{tier.minReferrals}+ referrals</p>
                  <p className="text-3xl font-bold text-primary mb-4">{tier.commission}</p>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div className="max-w-2xl mx-auto mb-16">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-1">Apply Now</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Fill out the form and our partnerships team will review your application.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Full Name"
                      placeholder="Ar. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="priya@firm.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Firm Name"
                      placeholder="Design Solutions Inc."
                      value={formData.firm}
                      onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                    />
                    <Input
                      label="License Number"
                      placeholder="ARCH-2024-12345"
                      value={formData.license}
                      onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Years of Experience"
                    placeholder="10+"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">How did you hear about us?</label>
                    <textarea
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm min-h-[80px] resize-y"
                      placeholder="Tell us a bit about how you found PlanCraftAI..."
                      value={formData.referral}
                      onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
                    />
                  </div>
                  <Button type="submit" size="lg">
                    Submit Application
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="max-w-xl mx-auto">
              <CardContent className="py-8">
                <h2 className="text-xl font-bold mb-2">Already an architect?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">List your services in our marketplace and get discovered by homeowners.</p>
                <Link href="/marketplace/architects">
                  <Button>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
