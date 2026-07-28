"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Hexagon, LayoutDashboard, FolderKanban, Wand2, Sparkles, IndianRupee, Download,
  Settings, Search, Bell, Menu, X, ChevronDown, ChevronRight, Users, Library,
  History, LayoutTemplate, CreditCard, BarChart3, Star, Share2, LogOut,
  Sun, Moon, Palette, Building2, Zap, Upload, Scan, Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/lib/stores/notification-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useProjectStore } from "@/lib/stores/project-store";
import { useTheme } from "@/components/theme-provider";
import { motion, AnimatePresence } from "framer-motion";

// Memoized so it only re-renders when its own props change, not on every
// pathname update that happens to hit the parent.
const NavItem = React.memo(function NavItem({ item, isActive }: { item: { name: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: string; highlight?: boolean }; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      prefetch={true}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group relative",
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/25"
          : item.highlight
          ? "text-primary bg-primary/10 hover:bg-primary/20"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "")} />
      <span className="flex-1 truncate">{item.name}</span>
      {item.badge && !isActive && (
        <span className="text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
});


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const { setTheme, resolvedTheme } = useTheme();
  const { unreadCount } = useNotificationStore();
  const { user, logout } = useAuthStore();
  const { projects } = useProjectStore();

  const sidebarGroups = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Projects", href: "/dashboard/projects", icon: FolderKanban, badge: projects.length.toString() },
        { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
      ],
    },
    {
      label: "Create & Design",
      items: [
        { name: "AI Image Studio", href: "/dashboard/ai-studio", icon: Sparkles, highlight: true },
        { name: "Generate Plan", href: "/generate", icon: Wand2 },
        { name: "AI Assistant", href: "/dashboard/ai", icon: Sparkles },
        { name: "AI History", href: "/dashboard/history", icon: History },
        { name: "Image Upload", href: "/dashboard/upload", icon: Upload },
        { name: "AI Processing", href: "/dashboard/process", icon: Scan },
        { name: "2D & 3D Rendering", href: "/dashboard/rendering", icon: Image },
        { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
        { name: "Floor Plan Library", href: "/dashboard/library", icon: Library },
      ],
    },
    {
      label: "Collaboration",
      items: [
        { name: "Team Workspace", href: "/dashboard/team", icon: Users },
        { name: "Sharing", href: "/dashboard/sharing", icon: Share2 },
        { name: "Reviews", href: "/dashboard/reviews", icon: Star },
      ],
    },
    {
      label: "Analysis",
      items: [
        { name: "Cost Estimator", href: "/analysis/cost", icon: IndianRupee },
        { name: "Usage Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Exports", href: "/dashboard/exports", icon: Download },
      ],
    },
    {
      label: "Account",
      items: [
        { name: "Subscription", href: "/dashboard/subscription", icon: Zap },
        { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
              <Hexagon className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">PlanCraftAI</span>
          </Link>
          <button className="lg:hidden p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Workspace pill */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold flex-1 text-left truncate">Personal Workspace</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {sidebarGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3 mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name ?? "Guest"}</p>
              <div className="flex items-center gap-1">
                <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary uppercase">{(user?.plan ?? "free")}</span>
                <span className="text-xs text-slate-400 truncate">{user?.email ?? ""}</span>
              </div>
            </div>
            <button onClick={() => { logout(); router.push("/"); }} className="p-1 opacity-0 group-hover:opacity-100 hover:text-danger transition-all" title="Logout">
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between gap-4 px-4 lg:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors -ml-1" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center relative max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search projects, templates..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            <Link href="/dashboard/notifications" className="p-2 relative text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white dark:border-zinc-900" />
              )}
            </Link>

            <Link
              href="/generate"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Wand2 className="w-4 h-4" />
              New Project
            </Link>
          </div>
        </header>

        {/* Page content with Suspense so navigations show a skeleton, not a blank */}
        <div className="flex-1 overflow-auto">
          <React.Suspense fallback={
            <div className="flex-1 p-6 space-y-4 animate-pulse">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                ))}
              </div>
              <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          }>
            {children}
          </React.Suspense>
        </div>
      </main>
    </div>
  );
}
