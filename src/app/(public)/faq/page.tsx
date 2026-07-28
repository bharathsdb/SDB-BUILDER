"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Search, HelpCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";

interface QAPair {
  question: string;
  answer: string;
  category: string;
}

const faqs: QAPair[] = [
  // General
  { category: "General", question: "What is PlanCraftAI?", answer: "PlanCraftAI is an AI-powered architectural design platform that generates intelligent floor plans, 3D models, Vastu analysis, and cost estimates from simple inputs like plot dimensions and room preferences." },
  { category: "General", question: "Do I need architectural experience to use PlanCraftAI?", answer: "Not at all! PlanCraftAI is designed for everyone — homeowners, builders, and architects alike. The AI handles the technical complexity, and our intuitive interface makes it easy to customize designs." },
  { category: "General", question: "Is PlanCraftAI free to use?", answer: "We offer a free tier that lets you generate up to 3 floor plans. Our Pro plan starts at $19/month for unlimited generations and advanced features like Vastu analysis and 3D walkthroughs." },
  { category: "General", question: "Can I collaborate with my team on PlanCraftAI?", answer: "Yes! Our Team plan allows multiple users to collaborate on projects in real-time, share designs, and manage permissions. Contact sales for enterprise collaboration features." },
  
  // Plans & Pricing
  { category: "Plans & Pricing", question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual enterprise plans. All payments are processed securely through Stripe." },
  { category: "Plans & Pricing", question: "Can I upgrade or downgrade my plan?", answer: "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades apply at the start of the next billing cycle." },
  { category: "Plans & Pricing", question: "Is there a student or education discount?", answer: "Yes! We offer a 50% discount for students, teachers, and educational institutions. Verify your academic email address to access the education plan." },
  { category: "Plans & Pricing", question: "What happens if I exceed my plan limits?", answer: "You'll receive a notification when you've used 80% of your limit. If you exceed the limit, you can upgrade your plan or wait for the next billing cycle for the limit to reset." },
  
  // Technical
  { category: "Technical", question: "What browsers does PlanCraftAI support?", answer: "PlanCraftAI supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best 3D experience, we recommend using Chrome or Edge." },
  { category: "Technical", question: "What file formats can I export?", answer: "We support export to PDF, PNG, SVG, DWG (AutoCAD), and IFC (BIM). The Pro plan also includes batch export and cloud storage integration." },
  { category: "Technical", question: "How does the AI generate floor plans?", answer: "Our AI uses deep learning models trained on millions of architectural floor plans. It processes your inputs (dimensions, rooms, style) and generates optimized layouts that comply with building standards." },
  { category: "Technical", question: "Is my data secure on PlanCraftAI?", answer: "Absolutely. We use AES-256 encryption at rest and TLS 1.3 in transit. Our infrastructure is SOC 2 compliant and hosted on AWS. See our Security page for more details." },
  
  // Vastu
  { category: "Vastu", question: "What is Vastu-based design?", answer: "Vastu Shastra is an ancient Indian architectural science that governs design principles based on directional energies. PlanCraftAI automatically analyzes your floor plan against Vastu guidelines." },
  { category: "Vastu", question: "Can I get Vastu suggestions for my existing plan?", answer: "Yes! Upload your existing floor plan, and our AI will analyze it for Vastu compliance. You'll receive a detailed report with scores and actionable improvement suggestions." },
  { category: "Vastu", question: "Does PlanCraftAI support different Vastu traditions?", answer: "Yes, we support both North Indian and South Indian Vastu traditions, as well as regional variations. You can select your preferred tradition in the Vastu analysis settings." },
  
  // Export
  { category: "Export", question: "Can I export my designs for construction?", answer: "Yes. Export to DWG and IFC formats produces construction-ready drawings that architects and contractors can use directly. We also support PDF with precise scaling." },
  { category: "Export", question: "Do exported files include dimensions and annotations?", answer: "Yes, all exports include dimension lines, room labels, and annotation layers. You can customize which elements to include in the export settings." },
];

const categories = ["All", "General", "Plans & Pricing", "Technical", "Vastu", "Export"];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-4xl px-4 md:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <HelpCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Everything you need to know about PlanCraftAI. Can&apos;t find what you&apos;re looking for? Reach out to our team.
              </p>
            </motion.div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          {filteredFaqs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <MessageCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No questions found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => {
                const globalIndex = faqs.indexOf(faq);
                const isOpen = openIndex === globalIndex;
                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.02 }}
                    className="glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(globalIndex)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="info" className="text-[10px] px-1.5 py-0">{faq.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-sm">{faq.question}</h3>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Still have questions */}
          <div className="mt-8 p-6 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
            <h3 className="font-bold text-lg mb-1">Still have questions?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Can&apos;t find the answer you&apos;re looking for? Please contact our support team.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/contact">
                <Button>Contact Support</Button>
              </Link>
              <Link href="/docs">
                <Button variant="secondary">View Docs</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
