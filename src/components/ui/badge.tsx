"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "info";
interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode; className?: string }

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  secondary: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-primary/10 text-primary",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>{children}</span>;
}
