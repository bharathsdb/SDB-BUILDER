"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X, Hexagon, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuthStore } from "@/lib/stores/auth-store";
import { setTokens } from "@/lib/api-client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Showcase", href: "#showcase" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const { user, login, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleLogin = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "glass-card dark:glass-card-dark border-slate-200 dark:border-slate-800" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 bg-primary rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform">
            <Hexagon className="w-6 h-6 absolute" />
            <Sparkles className="w-3 h-3 absolute top-1.5 right-1.5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            PlanCraftAI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
            {!isAuthenticated && (
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Login
              </button>
            )}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors w-9 h-9 flex items-center justify-center"
              aria-label="Toggle Theme"
              title="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                )
              }
            </button>
            <Link
              href="/generate"
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Start Designing
            </Link>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-20 left-0 w-full glass-card dark:glass-card-dark border-b border-slate-200 dark:border-slate-800 shadow-xl"
        >
          <div className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary p-2"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <button
                onClick={() => { handleLogin(); setIsOpen(false); }}
                className="text-center px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-lg"
              >
                Login
              </button>
            )}
            <Link
              href="/generate"
              className="text-center px-5 py-3 bg-primary text-white font-semibold rounded-lg shadow-md"
              onClick={() => setIsOpen(false)}
            >
              Start Designing
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
