"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Hexagon, LayoutDashboard, Users, IndianRupee, FolderKanban, Sparkles, CreditCard, ShoppingBag, Menu, X, Bell, Shield, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Revenue", href: "/admin/revenue", icon: IndianRupee },
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "AI Usage", href: "/admin/ai-usage", icon: Sparkles },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg text-white">
              <Hexagon className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white">PlanCraftAI</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 rounded-lg">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-3 mt-4">Main Menu</div>
          {adminLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <link.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-zinc-500 group-hover:text-white")} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-zinc-400" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 relative text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-danger rounded-full border border-zinc-900" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">AU</div>
              <span className="text-sm font-medium text-white hidden sm:block">Admin User</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
