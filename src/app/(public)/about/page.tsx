"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Target, Heart, Eye, Quote, Users, Rocket, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge } from "@/components/ui";

const team = [
  { name: "Arjun Mehta", role: "CEO & Co-Founder", image: "AM", bio: "Former architect turned entrepreneur. 15 years in AEC technology." },
  { name: "Sarah Chen", role: "CTO & Co-Founder", image: "SC", bio: "AI researcher from Stanford. Previously led ML teams at Google." },
  { name: "Rahul Sharma", role: "Head of Design", image: "RS", bio: "Design leader with experience at Autodesk and SketchUp." },
  { name: "Priya Patel", role: "Head of Engineering", image: "PP", bio: "Full-stack architect. Built scalable systems at Amazon and Uber." },
  { name: "James Wilson", role: "VP of Product", image: "JW", bio: "Product leader who shipped products used by millions." },
  { name: "Mei Lin", role: "Head of AI Research", image: "ML", bio: "PhD in Computer Vision. Published 20+ papers in top venues." },
];

const milestones = [
  { year: "2023", event: "PlanCraftAI founded in Austin, TX with a team of 4" },
  { year: "2023", event: "Raised $3M seed round from top-tier VC firms" },
  { year: "2024", event: "Launched beta with 1,000+ waitlist signups" },
  { year: "2024", event: "Released AI floor plan generator v1.0" },
  { year: "2024", event: "Surpassed 10,000 active users globally" },
  { year: "2025", event: "Launched Vastu analysis and cost estimation features" },
  { year: "2025", event: "Series A funding of $15M. Team grows to 50+" },
  { year: "2025", event: "Introduced 3D walkthrough and BIM export capabilities" },
  { year: "2026", event: "Expanded to 40+ countries with enterprise partnerships" },
];

const stats = [
  { value: "10K+", label: "Projects Generated", icon: Rocket },
  { value: "50K+", label: "Active Users", icon: Users },
  { value: "99.9%", label: "Uptime SLA", icon: Award },
  { value: "40+", label: "Countries", icon: TrendingUp },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="info" className="mb-4">Our Story</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Building the Future of Home Design</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                PlanCraftAI is on a mission to make architectural design accessible to everyone. 
                We combine artificial intelligence with architectural expertise to help anyone 
                create beautiful, functional, and compliant floor plans in minutes.
              </p>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Card className="text-center">
                    <CardContent>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardContent>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Our Mission</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  To democratize architectural design by making AI-powered tools accessible to 
                  homeowners, architects, and builders worldwide. We believe everyone deserves 
                  a home designed with care, precision, and intelligence.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">Our Values</h2>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong>Innovation First</strong> — We push the boundaries of what&apos;s possible with AI in architecture.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong>User Obsessed</strong> — Every decision starts with what&apos;s best for our users.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong>Global Mindset</strong> — Building for diverse cultures, climates, and architectural traditions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span><strong>Radical Transparency</strong> — Open communication, honest feedback, and shared ownership.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Rocket className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Our Journey</h2>
            </div>
            <div className="space-y-4">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                    {i < milestones.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800" />}
                  </div>
                  <div className="pb-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1">
                      {milestone.year}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{milestone.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Meet the Team</h2>
              <p className="text-slate-500 dark:text-slate-400">The people behind PlanCraftAI</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.map((member) => (
                <Card key={member.name}>
                  <CardContent>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <span className="text-sm font-bold text-primary">{member.image}</span>
                    </div>
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-xs text-primary font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card>
            <CardContent className="text-center py-10">
              <Quote className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">Want to be part of our story?</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xl mx-auto">
                We&apos;re always looking for talented people who share our vision. 
                Check out our open positions or reach out to us.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/careers">
                  <Button>View Openings</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary">Contact Us</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
