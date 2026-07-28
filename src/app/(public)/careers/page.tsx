"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, Heart, Shield, Coffee, GraduationCap, Laptop, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Badge, Card, CardContent, CardHeader } from "@/components/ui";
import { Modal } from "@/components/ui/modal";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Remote" | "Hybrid" | "On-site";
  description: string;
  requirements: string[];
}

const jobs: Job[] = [
  {
    id: "senior-architect-ai",
    title: "Senior AI Architect",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Hybrid",
    description: "Lead the design and development of our AI-powered floor plan generation engine. Work on cutting-edge computer vision and generative models.",
    requirements: [
      "8+ years of software engineering experience",
      "Strong background in ML/DL, especially computer vision",
      "Experience with generative models (GANs, Diffusion)",
      "Proficiency in Python, PyTorch, and TensorFlow",
    ],
  },
  {
    id: "fullstack-engineer",
    title: "Full Stack Engineer",
    department: "Engineering",
    location: "Bangalore, India",
    type: "Remote",
    description: "Build and maintain the PlanCraftAI web application. Work across the stack from React frontend to Node.js backend services.",
    requirements: [
      "5+ years of full stack development experience",
      "Expertise in React, Next.js, and TypeScript",
      "Experience with Node.js, PostgreSQL, and Redis",
      "Familiarity with cloud services (AWS/GCP)",
    ],
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    department: "Design",
    location: "Singapore",
    type: "Hybrid",
    description: "Design intuitive and beautiful interfaces for our architectural design platform. Shape the user experience from concept to pixel.",
    requirements: [
      "4+ years of product design experience",
      "Proficiency in Figma and prototyping tools",
      "Strong portfolio demonstrating web app design",
      "Understanding of design systems and accessibility",
    ],
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    department: "Engineering",
    location: "Austin, TX",
    type: "Remote",
    description: "Develop and optimize ML models for Vastu analysis, cost estimation, and design recommendations.",
    requirements: [
      "3+ years of ML engineering experience",
      "Experience deploying models to production",
      "Knowledge of MLOps and CI/CD for ML pipelines",
      "Background in computer graphics is a plus",
    ],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    type: "Hybrid",
    description: "Drive the product roadmap for PlanCraftAI. Work closely with engineering, design, and business teams to deliver value to users.",
    requirements: [
      "5+ years of product management experience",
      "Experience with B2B SaaS platforms",
      "Strong analytical and data-driven decision making",
      "Technical background or familiarity with AI/ML",
    ],
  },
  {
    id: "customer-success",
    title: "Customer Success Manager",
    department: "Growth",
    location: "Dubai, UAE",
    type: "On-site",
    description: "Ensure our customers achieve their goals with PlanCraftAI. Drive adoption, retention, and expansion across our customer base.",
    requirements: [
      "3+ years in customer success or account management",
      "Experience in AEC (Architecture/Engineering/Construction) industry",
      "Excellent communication and presentation skills",
      "Multilingual abilities are a plus",
    ],
  },
];

const benefits = [
  { icon: Laptop, title: "Remote-First", description: "Work from anywhere in the world with flexible hours." },
  { icon: Heart, title: "Health & Wellness", description: "Comprehensive medical, dental, and vision coverage for you and your family." },
  { icon: Coffee, title: "Learning Budget", description: "Annual budget for courses, conferences, and certifications." },
  { icon: GraduationCap, title: "Stock Options", description: "Equity grants for all full-time employees." },
  { icon: Shield, title: "Paid Time Off", description: "Unlimited PTO policy with a minimum of 4 weeks encouraged." },
  { icon: Users, title: "Team Retreats", description: "Bi-annual company retreats at amazing locations worldwide." },
];

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="info" className="mb-4">We&apos;re Hiring!</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Join the Team Building the Future of Architecture</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                At PlanCraftAI, we&apos;re combining AI and architecture to democratize home design. 
                Come shape the future with us.
              </p>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { value: "50+", label: "Team Members" },
              { value: "15+", label: "Nationalities" },
              { value: "6", label: "Office Locations" },
              { value: "92%", label: "Employee Satisfaction" },
            ].map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent>
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Briefcase className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Open Positions</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full">
                    <CardContent>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{job.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{job.department}</p>
                        </div>
                        <Badge variant="success">{job.type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                        {job.description}
                      </p>
                      <Button
                        onClick={() => setSelectedJob(job)}
                        className="w-full"
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Benefits & Perks</h2>
              <p className="text-slate-500 dark:text-slate-400">We take care of our team</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title}>
                    <CardContent>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Values */}
          <Card>
            <CardContent className="text-center py-10">
              <Star className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">Our Values</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                We believe in innovation, inclusivity, and impact. Every team member at PlanCraftAI has 
                the autonomy to drive change and the support to grow. We build for the world, and we 
                build with each other.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        title={`Apply for ${selectedJob?.title}`}
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              {selectedJob.location}
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4" />
              {selectedJob.type}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{selectedJob.description}</p>
            <div>
              <h4 className="font-semibold mb-2">Requirements</h4>
              <ul className="space-y-1.5">
                {selectedJob.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Send your resume and portfolio to <span className="text-primary font-medium">careers@plancraftai.com</span>
              </p>
              <div className="flex gap-3">
                <Button onClick={() => { navigator.clipboard.writeText("careers@plancraftai.com"); }} variant="secondary">
                  Copy Email
                </Button>
                <Button onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PublicLayout>
  );
}
