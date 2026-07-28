"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Globe, Lock, Cookie, Database, Eye, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Badge } from "@/components/ui";

const sections = [
  {
    id: "information-collection",
    title: "1. Information We Collect",
    content: (
      <>
        <p>We collect information you provide directly when creating an account, using the Service, or communicating with us. This includes:</p>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Account Information:</strong> Name, email address, profile photo, and billing information.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Design Data:</strong> Floor plans, project specifications, dimensions, room layouts, and generated 3D models.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Usage Data:</strong> Interactions with the platform, features used, session duration, and error logs.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</span></li>
        </ul>
        <p>We also use cookies and similar tracking technologies as described in Section 4.</p>
      </>
    ),
  },
  {
    id: "data-usage",
    title: "2. How We Use Your Data",
    content: (
      <>
        <p>We use the collected information for the following purposes:</p>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>To provide, maintain, and improve the PlanCraftAI service and its features.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>To process transactions, send invoices, and manage your subscription.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>To train and improve our AI models (using anonymized design data only — never identifiable information).</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>To send technical notices, security alerts, and support messages.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>To detect and prevent fraud, abuse, and security incidents.</span></li>
        </ul>
        <p>We do not use your floor plans or design data to train models for competing products.</p>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing and Disclosure",
    content: (
      <>
        <p>We do not sell your personal information. We may share data in limited circumstances:</p>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Service Providers:</strong> With third-party vendors who help us operate the Service (e.g., cloud hosting, payment processing). They are bound by data processing agreements.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Legal Requirements:</strong> When required by law, court order, or government request, or to protect our rights, property, or safety.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets. You will be notified of any change in ownership.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>With Your Consent:</strong> When you explicitly choose to share specific designs or project data with others through collaboration features.</span></li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies and Tracking",
    content: (
      <>
        <p>We use cookies and similar technologies to enhance your experience, analyze usage, and support our marketing efforts.</p>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Essential Cookies:</strong> Required for the Service to function properly (authentication, security, session management).</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform to improve the experience.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Preference Cookies:</strong> Remember your settings, theme preferences, and UI configuration.</span></li>
        </ul>
        <p>You can control cookie preferences through your browser settings. Disabling certain cookies may affect functionality.</p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: (
      <>
        <p>We retain your data for as long as your account is active or as needed to provide the Service. Specific retention periods:</p>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Active Accounts:</strong> Data is retained for the duration of your subscription plus 90 days for account recovery.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Deleted Accounts:</strong> Data is permanently deleted within 30 days of account deletion request.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Anonymized Data:</strong> Aggregated, anonymized data used for model training may be retained indefinitely.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Backup Retention:</strong> Encrypted backups are retained for 90 days after deletion.</span></li>
        </ul>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "6. Your Rights (GDPR & CCPA)",
    content: (
      <>
        <p>Depending on your jurisdiction, you have certain rights regarding your personal data:</p>

        <h3 className="font-semibold mt-4 mb-2">GDPR Rights (EU/EEA Users)</h3>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Erasure:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;).</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used format.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Object:</strong> Object to processing of your data for specific purposes.</span></li>
        </ul>

        <h3 className="font-semibold mt-4 mb-2">CCPA Rights (California Users)</h3>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Know:</strong> Request disclosure of data collection, use, and sharing practices.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Delete:</strong> Request deletion of personal information collected from you.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Opt-Out:</strong> Opt out of the sale of your personal information (we do not sell data).</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights.</span></li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "7. Contact Information",
    content: (
      <>
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our Data Protection Officer:</p>
        <ul className="space-y-1">
          <li className="text-sm"><strong>Email:</strong> privacy@plancraftai.com</li>
          <li className="text-sm"><strong>DPO Email:</strong> dpo@plancraftai.com</li>
          <li className="text-sm"><strong>Address:</strong> 200 Congress Ave, Suite 800, Austin, TX 78701</li>
          <li className="text-sm"><strong>Phone:</strong> +1 (512) 555-0101</li>
        </ul>
        <p className="mt-4">We will respond to all requests within 30 days. If you are unsatisfied with our response, you have the right to lodge a complaint with your local data protection authority.</p>
      </>
    ),
  },
];

const lastUpdated = "June 1, 2026";

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
          </div>

          {/* GDPR/CCPA badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Badge variant="info">GDPR Compliant</Badge>
            <Badge variant="info">CCPA Compliant</Badge>
            <Badge variant="success">Data Encrypted at Rest</Badge>
            <Badge variant="success">No Data Selling</Badge>
          </div>

          {/* Content */}
          <Card>
            <CardContent className="p-6 md:p-8 space-y-8">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                This Privacy Policy explains how PlanCraftAI Inc. (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, 
                uses, shares, and protects your personal information when you use our AI-powered 
                architectural design platform. We are committed to protecting your privacy and 
                being transparent about our data practices.
              </p>

              {sections.map((section) => (
                <motion.section
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  id={section.id}
                >
                  <h2 className="text-xl font-bold mb-3">{section.title}</h2>
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {section.content}
                  </div>
                </motion.section>
              ))}
            </CardContent>
          </Card>

          {/* Footer links */}
          <div className="mt-8 flex flex-wrap gap-4 justify-between items-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Also review our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/security" className="text-primary hover:underline">Security</Link> page.
            </p>
            <Link href="/contact">
              <Button variant="secondary">Questions? Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
