"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent } from "@/components/ui";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p>By accessing or using PlanCraftAI (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all the terms, you may not access or use the Service.</p>
        <p>These Terms constitute a legally binding agreement between you (&quot;User&quot; or &quot;You&quot;) and PlanCraftAI Inc. (&quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;). The Service is provided for your personal or business use subject to these Terms.</p>
        <p>We reserve the right to update or modify these Terms at any time. Material changes will be notified via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.</p>
      </>
    ),
  },
  {
    id: "account-terms",
    title: "2. Account Terms",
    content: (
      <>
        <p>To use the Service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
        <p>You must provide accurate, current, and complete information during registration. You may not create accounts by automated means or under false pretenses.</p>
        <p>You must be at least 18 years of age to use the Service. If you are under 18, you may use the Service only with the involvement of a parent or guardian.</p>
        <p>You are responsible for all content generated through your account and for ensuring that your use complies with applicable laws and regulations.</p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "3. Acceptable Use",
    content: (
      <>
        <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul className="space-y-1.5">
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>Upload or generate content that infringes on intellectual property rights, is defamatory, obscene, or otherwise objectionable.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>Attempt to reverse engineer, decompile, or extract the source code of the Service.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>Interfere with or disrupt the Service, servers, or networks connected to the Service.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>Use bots, scrapers, or automated tools to access the Service without prior written permission.</span></li>
          <li className="flex items-start gap-2"><span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" /><span>Share your account credentials with others or allow unauthorized access to your account.</span></li>
        </ul>
      </>
    ),
  },
  {
    id: "payment-terms",
    title: "4. Payment Terms",
    content: (
      <>
        <p>Paid plans are billed in advance on a monthly or annual basis depending on your chosen subscription. All payments are non-refundable except as expressly stated in this policy.</p>
        <p>We use Stripe for payment processing. Your payment information is never stored on our servers. By providing payment information, you authorize us to charge the applicable fees.</p>
        <p>Prices are subject to change with 30 days&apos; notice. Price changes will not affect your current billing cycle. If you do not agree to a price change, you may cancel before it takes effect.</p>
        <p>Failed payments may result in account suspension. We will attempt to process the payment three times before suspending access. Your data will be retained for 30 days after suspension.</p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property",
    content: (
      <>
        <p>The Service, including its code, design, algorithms, and AI models, is the intellectual property of PlanCraftAI Inc. You may not copy, modify, distribute, or create derivative works without our express permission.</p>
        <p>You retain full ownership of all floor plans, designs, and content you create using the Service. We do not claim any intellectual property rights over your generated content.</p>
        <p>By using the Service, you grant us a non-exclusive, worldwide license to host, store, and display your content solely for the purpose of providing the Service to you.</p>
        <p>Feedback and suggestions you provide about the Service may be used by us without compensation or attribution.</p>
      </>
    ),
  },
  {
    id: "termination",
    title: "6. Termination",
    content: (
      <>
        <p>You may terminate your account at any time by contacting support or through your account settings. Upon termination, you will lose access to the Service at the end of your current billing period.</p>
        <p>We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or if your use poses a risk to the Service or other users.</p>
        <p>Upon termination, we will provide you with a 30-day window to export your data. After this period, your data will be permanently deleted from our systems.</p>
        <p>Sections 5 (Intellectual Property), 7 (Limitation of Liability), and 8 (Contact) shall survive termination of these Terms.</p>
      </>
    ),
  },
  {
    id: "limitation-liability",
    title: "7. Limitation of Liability",
    content: (
      <>
        <p>The Service is provided &quot;as is&quot; without warranty of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
        <p>PlanCraftAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, even if advised of the possibility of such damages.</p>
        <p>Our total liability for any claim arising from these Terms or the Service shall not exceed the amount you have paid us in the 12 months preceding the claim.</p>
        <p>Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such jurisdictions, our liability shall be limited to the maximum extent permitted by law.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "8. Contact Information",
    content: (
      <>
        <p>For questions about these Terms, please contact us:</p>
        <ul className="space-y-1">
          <li className="text-sm"><strong>Email:</strong> legal@plancraftai.com</li>
          <li className="text-sm"><strong>Address:</strong> 200 Congress Ave, Suite 800, Austin, TX 78701</li>
          <li className="text-sm"><strong>Phone:</strong> +1 (512) 555-0100</li>
        </ul>
        <p className="mt-4">For legal notices, please send physical mail to our registered agent at the address above. We will respond to all inquiries within 30 days.</p>
      </>
    ),
  },
];

const lastUpdated = "June 1, 2026";

export default function TermsPage() {
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
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>
          </div>

          {/* Content */}
          <Card>
            <CardContent className="p-6 md:p-8 space-y-8">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Please read these Terms of Service carefully before using the PlanCraftAI platform. 
                These Terms govern your access to and use of our AI-powered architectural design service.
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
              Also review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
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
