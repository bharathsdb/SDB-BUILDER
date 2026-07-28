"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  showValue?: boolean;
  className?: string;
}

const colorMap = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

const bgMap = {
  primary: "bg-primary/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-danger/10",
  info: "bg-info/10",
};

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value, max = 100, label, sublabel, color = "primary", size = "md",
  animated = true, showValue = false, className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full overflow-hidden", bgMap[color], sizeMap[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            colorMap[color],
            animated && "relative overflow-hidden",
          )}
          style={{ width: `${width}%` }}
        >
          {animated && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ animation: "shimmer 2s ease-in-out infinite" }}
            />
          )}
        </div>
      </div>
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function CircularProgress({
  value, max = 100, size = 80, strokeWidth = 6, color = "var(--primary)",
  label, sublabel, className,
}: CircularProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>{Math.round(pct)}%</span>
        </div>
      </div>
      {label && <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>}
      {sublabel && <span className="text-xs text-slate-400">{sublabel}</span>}
    </div>
  );
}
