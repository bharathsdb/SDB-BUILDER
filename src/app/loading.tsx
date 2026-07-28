import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex h-[100dvh] w-full flex-col items-center justify-center bg-background/80 backdrop-blur-md z-[9999]">
      <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 shadow-[0_0_40px_rgba(var(--primary),0.2)]">
          <Loader2 className="h-10 w-10 animate-spin text-primary drop-shadow-md" />
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-[spin_2s_linear_infinite]" />
        </div>
        
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">
            PlanCraftAI
          </h2>
          <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}
