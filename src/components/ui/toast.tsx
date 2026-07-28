"use client";
import { useUIStore } from "@/lib/stores/ui-store";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const icons = { success: <CheckCircle2 className="w-5 h-5 text-success" />, error: <XCircle className="w-5 h-5 text-danger" />, info: <Info className="w-5 h-5 text-primary" /> };

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800">
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-foreground"><X className="w-4 h-4" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
