"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { useUIStore } from "@/lib/stores/ui-store";

const offices = [
  { city: "Mumbai", address: "50 G Block, Bandra Kurla Complex, Mumbai 400051", phone: "+91 22 4123 4567", flag: "🇮🇳" },
  { city: "Singapore", address: "71 Robinson Road, #14-01, Singapore 068895", phone: "+65 6234 5678", flag: "🇸🇬" },
  { city: "Dubai", address: "Level 12, Emirates Towers, Sheikh Zayed Road, Dubai", phone: "+971 4 234 5678", flag: "🇦🇪" },
  { city: "Austin", address: "200 Congress Ave, Suite 800, Austin, TX 78701", phone: "+1 (512) 555-0199", flag: "🇺🇸" },
];

const socialLinks = [
  { name: "Twitter / X", href: "#", icon: "𝕏" },
  { name: "LinkedIn", href: "#", icon: "in" },
  { name: "GitHub", href: "#", icon: "GH" },
];

export default function ContactPage() {
  const addToast = useUIStore((s) => s.addToast);
  const [formData, setFormData] = React.useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = "Invalid email address";
    if (!formData.subject.trim()) errs.subject = "Subject is required";
    if (!formData.message.trim()) errs.message = "Message is required";
    else if (formData.message.trim().length < 10) errs.message = "Message must be at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addToast("Message sent successfully! We'll get back to you soon.", "success");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setErrors({});
  };

  return (
    <PublicLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Have questions about PlanCraftAI? We&apos;d love to hear from you. 
                Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Your Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                        icon={<MessageSquare className="w-4 h-4" />}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                        icon={<Mail className="w-4 h-4" />}
                      />
                    </div>
                    <Input
                      label="Subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      error={errors.subject}
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Message</label>
                      <textarea
                        className={cn(
                          "w-full px-4 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm min-h-[120px] resize-y",
                          errors.message ? "border-danger focus:ring-danger/50" : "border-slate-200 dark:border-slate-800"
                        )}
                        placeholder="Tell us about your inquiry..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                      {errors.message && <p className="text-xs text-danger">{errors.message}</p>}
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      <Send className="w-4 h-4" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Company Info */}
              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a href="mailto:hello@plancraftai.com" className="text-sm text-primary hover:underline">
                          hello@plancraftai.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">+1 (512) 555-0100</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Headquarters</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          200 Congress Ave, Suite 800<br />Austin, TX 78701
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => (
                      <Link
                        key={social.name}
                        href={social.href}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all"
                      >
                        {social.icon}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Offices */}
              <Card>
                <CardContent>
                  <h3 className="font-bold mb-4">Our Offices</h3>
                  <div className="space-y-4">
                    {offices.map((office) => (
                      <div key={office.city} className="flex items-start gap-3">
                        <span className="text-lg">{office.flag}</span>
                        <div>
                          <p className="text-sm font-medium">{office.city}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{office.address}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{office.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
