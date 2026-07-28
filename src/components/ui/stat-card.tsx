"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  gradient?: boolean;
  className?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, subtitle, trend, trendLabel, icon, iconColor = "bg-primary/10 text-primary", gradient, className, onClick }: StatCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const isNeutral = trend === 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-2xl border transition-all duration-200",
        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-primary/30",
        gradient && "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-primary/5 before:to-accent/5 before:pointer-events-none",
        className
      )}
    >
      <div className="relative flex items-start justify-between mb-4">
        {icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm", iconColor)}>
            {icon}
          </div>
        )}
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            isPositive && "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400",
            isNegative && "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
            isNeutral && "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
          )}>
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {isNeutral && <Minus className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{value}</p>
        {(subtitle || trendLabel) && (
          <p className="text-xs text-slate-400 mt-1">
            {trendLabel ? trendLabel : subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
