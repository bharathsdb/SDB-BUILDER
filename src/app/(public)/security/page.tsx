"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Key, Server, CheckCircle2, FileCheck, Building2, Cloud, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge } from "@/components/ui";

const securitySections = [
  {
    title: "Encryption",
    icon: Lock,
    description: "All data is encrypted using industry-standard protocols to ensure confidentiality and integrity.",
    details: [
      "AES-256 encryption at rest for all stored data including projects, user information, and generated files.",
      "TLS 1.3 encryption in transit for all API communications and web interface connections.",
      "End-to-end encryption for sensitive design files shared between team members.",
      "Automated key rotation with HSM-backed key management for enterprise customers.",
    ],
  },
  {
    title: "Data Privacy",
    icon: Eye,
    description: "We are committed to protecting your personal data and respecting your privacy rights.",
    details: [
      "GDPR compliant — full data processing records, consent management, and data portability support.",
      "CCPA compliant — California residents can request data deletion, access, and opt-out of data sales.",
      "Strict data segregation between customers in multi-tenant environment.",
      "Regular privacy impact assessments and data protection officer oversight.",
    ],
  },
  {
    title: "Authentication",
    icon: Key,
    description: "Multiple layers of authentication to ensure only authorized access to your account.",
    details: [
      "Single Sign-On (SSO) support via SAML 2.0 and OAuth 2.0 for enterprise customers.",
      "Two-Factor Authentication (2FA) with TOTP, SMS, and hardware security key options.",
      "Role-Based Access Control (RBAC) with granular permissions for team accounts.",
      "Session management with automatic timeout, device tracking, and forced logout capabilities.",
    ],
  },
  {
    title: "Infrastructure",
    icon: Server,
    description: "Enterprise-grade infrastructure hosted on AWS with SOC 2 compliance.",
    details: [
      "AWS infrastructure with multi-region deployment for high availability and disaster recovery.",
      "SOC 2 Type II certified — audited annually for security, availability, and confidentiality.",
      "99.9% uptime SLA with automated failover and redundant systems across availability zones.",
      "24/7 infrastructure monitoring with automated threat detection and incident response.",
    ],
  },
  {
    title: "Compliance",
    icon: FileCheck,
    description: "We adhere to major compliance frameworks to meet enterprise and regulatory requirements.",
    details: [
      "SOC 2 Type II — Service Organization Control report available under NDA.",
      "GDPR — Full compliance with EU data protection regulations.",
      "CCPA — California Consumer Privacy Act compliance.",
      "ISO 27001 certified — Information Security Management System.",
    ],
  },
];

const badges = [
  { name: "AES-256", icon: Lock },
  { name: "SOC 2", icon: Building2 },
  { name: "GDPR", icon: Shield },
  { name: "ISO 27001", icon: CheckCircle2 },
  { name: "AWS", icon: Cloud },
  { name: "SSO", icon: Key },
];

const trustedBy = [
  "TechCorp Industries", "BuildRight Construction", "GreenHomes Realty",
  "ArchVision Studio", "UrbanPlan Developers", "EcoDesign Collective",
];

export default function SecurityPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-5xl px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <Badge variant="info" className="mb-4">Enterprise-Grade Security</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Security is Our Foundation</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                PlanCraftAI is built with security at its core. We employ industry-leading 
                practices to protect your data, designs, and privacy.
              </p>
            </motion.div>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.name}
                  className="flex items-center gap-2 px-4 py-2 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  {badge.name}
                </div>
              );
            })}
          </div>

          {/* Security Sections */}
          <div className="space-y-6 mb-16">
            {securitySections.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold">{section.title}</h2>
                            <Badge variant="success">Active</Badge>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{section.description}</p>
                          <ul className="space-y-2">
                            {section.details.map((detail, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Trusted By */}
          <Card>
            <CardContent className="text-center py-10">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-6">Trusted By Industry Leaders</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {trustedBy.map((company) => (
                  <div
                    key={company}
                    className="px-4 py-3 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300"
                  >
                    {company}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div>
              <h3 className="font-bold text-lg">Want to learn more?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Read our privacy policy or terms of service for detailed information.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/privacy">
                <Button variant="secondary">Privacy Policy</Button>
              </Link>
              <Link href="/terms">
                <Button variant="secondary">Terms of Service</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
