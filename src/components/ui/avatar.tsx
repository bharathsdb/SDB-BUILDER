"use client";
import { cn } from "@/lib/utils";

interface AvatarProps { src?: string; name: string; size?: "sm" | "md" | "lg"; className?: string; online?: boolean }

const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };

export function Avatar({ src, name, size = "md", className, online }: AvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className={cn("relative shrink-0", className)}>
      {src ? (
        <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size])} />
      ) : (
        <div className={cn("rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold", sizes[size])}>{initials}</div>
      )}
      {online !== undefined && (
        <span className={cn("absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-zinc-900 rounded-full", online ? "bg-success" : "bg-slate-400")} />
      )}
    </div>
  );
}
