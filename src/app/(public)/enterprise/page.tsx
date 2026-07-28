"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Shield, Users, Globe, Palette, HeadphonesIcon, ArrowRight, CheckCircle2, Code, Key, Cpu, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";

const enterpriseFeatures = [
  {
    icon: Code,
    title: "Custom API Access",
    description: "RESTful and GraphQL APIs for seamless integration with your existing tools and workflows.",
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/20",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description: "24/7 priority support with a dedicated account manager and guaranteed SLA.",
    color: "text-green-500 bg-green-100 dark:bg-green-900/20",
  },
  {
    icon: Key,
    title: "SSO & SAML",
    description: "Enterprise-grade single sign-on with support for Okta, Azure AD, and custom SAML providers.",
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/20",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Real-time collaboration with role-based access control, audit logs, and workspace management.",
    color: "text-amber-500 bg-amber-100 dark:bg-amber-900/20",
  },
  {
    icon: Palette,
    title: "White-Labeling",
    description: "Custom branding with your logo, colors, and domain. Embed PlanCraftAI in your own platform.",
    color: "text-pink-500 bg-pink-100 dark:bg-pink-900/20",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant, end-to-end encryption, data residency options, and regular penetration testing.",
    color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/20",
  },
];

export default function EnterprisePage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    company: "",
    size: "",
    message: "",
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
              <Badge variant="info" className="mb-4">Enterprise</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Built for Large-Scale Teams</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                From global architecture firms to real estate enterprises — PlanCraftAI scales with your organization.
              </p>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "50+", label: "Enterprise Clients", icon: Building2 },
              { value: "99.99%", label: "Uptime SLA", icon: Cpu },
              { value: "40+", label: "Countries", icon: Globe },
              { value: "10K+", label: "Team Seats", icon: Users },
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

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {enterpriseFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card className="h-full hover:border-primary/30 transition-colors">
                    <CardContent>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", feature.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Contact Form + Info */}
          <div className="grid md:grid-cols-5 gap-8 mb-16">
            <div className="md:col-span-3">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-1">Get in Touch</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Fill out the form and our enterprise team will reach out within 24 hours.</p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <Input
                        label="Work Email"
                        type="email"
                        placeholder="john@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Company Name"
                        placeholder="Acme Corp"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                      <Input
                        label="Team Size"
                        placeholder="50-100"
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Message</label>
                      <textarea
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm min-h-[120px] resize-y"
                        placeholder="Tell us about your project or requirements..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <Button type="submit" size="lg">
                      Send Enquiry
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2">What happens next?</h3>
                    <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Our team reviews your enquiry</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>We schedule a personalized demo</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Custom pricing proposal tailored to you</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                        <span>Onboarding and integration support</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2">Enterprise Benefits</h3>
                    <ul className="space-y-2 text-sm">
                      {["Custom contract terms", "Volume discounts", "Data residency options", "Custom integrations", "Employee training"].map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Link href="/contact">
                  <Button variant="secondary" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Or Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="max-w-xl mx-auto">
              <CardContent className="py-8">
                <h2 className="text-xl font-bold mb-2">Ready to scale with PlanCraftAI?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Join leading architecture firms and builders worldwide.</p>
                <Link href="/contact">
                  <Button size="lg">Talk to Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
