"use client";
import * as React from "react";
import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Hexagon className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">PlanCraftAI</span>
            </Link>
            <p className="text-slate-500 max-w-sm">The world&apos;s most advanced AI-powered architectural design platform.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/features" className="hover:text-primary">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              <li><Link href="/showcase" className="hover:text-primary">Showcase</Link></li>
              <li><Link href="/solutions" className="hover:text-primary">Solutions</Link></li>
              <li><Link href="/enterprise" className="hover:text-primary">Enterprise</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
              <li><Link href="/api-docs" className="hover:text-primary">API Docs</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link href="/security" className="hover:text-primary">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/about" className="hover:text-primary">About</Link></li>
              <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link href="/architects" className="hover:text-primary">Architects Program</Link></li>
              <li><Link href="/builders" className="hover:text-primary">Builders Program</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs">
          <p>&copy; {new Date().getFullYear()} PlanCraftAI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
