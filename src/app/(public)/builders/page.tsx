"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HardHat, Users, ArrowRight, CheckCircle2, BarChart3, DollarSign, ClipboardList, Truck, Shield, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge, Input } from "@/components/ui";

const benefits = [
  {
    icon: ClipboardList,
    title: "Project Management",
    description: "Track projects from blueprint to completion with integrated task management and milestone tracking.",
    color: "text-blue-500 bg-blue-100 dark:bg-blue-900/20",
  },
  {
    icon: DollarSign,
    title: "Cost Estimation",
    description: "Get accurate material quantity takeoffs and cost estimates with local pricing data.",
    color: "text-green-500 bg-green-100 dark:bg-green-900/20",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite your team, assign tasks, and communicate in real-time within each project.",
    color: "text-purple-500 bg-purple-100 dark:bg-purple-900/20",
  },
  {
    icon: Truck,
    title: "Material Sourcing",
    description: "Connect with suppliers through our marketplace to source materials at competitive prices.",
    color: "text-amber-500 bg-amber-100 dark:bg-amber-900/20",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Generate reports on project progress, budget utilization, and team performance.",
    color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/20",
  },
  {
    icon: Shield,
    title: "Compliance Tracking",
    description: "Ensure all designs meet local building codes and regulatory requirements.",
    color: "text-pink-500 bg-pink-100 dark:bg-pink-900/20",
  },
];

export default function BuildersPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    size: "",
    projects: "",
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
              <Badge variant="info" className="mb-4">Builders Program</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Built for Builders</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                Streamline your construction workflow from blueprint to build with AI-powered project management tools.
              </p>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "300+", label: "Builder Partners", icon: HardHat },
              { value: "2.5K+", label: "Projects Managed", icon: ClipboardList },
              { value: "4.8", label: "Avg. Rating", icon: Star },
              { value: "15%", label: "Cost Savings", icon: DollarSign },
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
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">Why Join the Builders Program?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8">Tools designed to help builders build better, faster, and more profitably.</p>
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

          {/* How it works */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Sign Up", desc: "Create your builder profile and set up your company details." },
                { step: "02", title: "Import Project", desc: "Import a PlanCraftAI design or upload your own blueprints." },
                { step: "03", title: "Build & Track", desc: "Manage materials, costs, team, and timeline in one place." },
              ].map((item) => (
                <Card key={item.step} className="text-center">
                  <CardContent className="py-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Signup Form */}
          <div className="max-w-2xl mx-auto mb-16">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-1">Register Your Company</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Join the builders program and transform your construction workflow.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Full Name"
                      placeholder="Mike Builder"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="mike@buildco.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Company Name"
                      placeholder="BuildRight Construction"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Company Size"
                      placeholder="50-100 employees"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    />
                    <Input
                      label="Avg. Projects/Year"
                      placeholder="10-20"
                      value={formData.projects}
                      onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                    />
                  </div>
                  <Button type="submit" size="lg">
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Testimonial */}
          <div className="mb-16">
            <Card className="max-w-3xl mx-auto">
              <CardContent className="py-8 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <blockquote className="text-lg italic text-slate-600 dark:text-slate-300 mb-4">
                  &quot;PlanCraftAI has transformed how we estimate and manage projects. We&apos;ve cut our pre-construction planning time by 60% and reduced material waste by 15%.&quot;
                </blockquote>
                <div>
                  <p className="font-bold">— Mike Johnson</p>
                  <p className="text-sm text-slate-500">CEO, BuildRight Construction</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Card className="max-w-xl mx-auto">
              <CardContent className="py-8">
                <h2 className="text-xl font-bold mb-2">Ready to build smarter?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Join hundreds of builders already using PlanCraftAI.</p>
                <Link href="/signup">
                  <Button size="lg">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
