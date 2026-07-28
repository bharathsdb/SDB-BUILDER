"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, label, error, icon, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-foreground">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm",
          icon && "pl-10",
          error ? "border-danger focus:ring-danger/50" : "border-slate-200 dark:border-slate-800",
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
));
Input.displayName = "Input";
