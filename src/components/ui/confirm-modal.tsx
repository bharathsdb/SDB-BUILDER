"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "info";
}

const variantStyles = {
  danger: { icon: "text-danger bg-danger/10", button: "bg-danger hover:bg-danger/90 text-white" },
  warning: { icon: "text-warning bg-warning/10", button: "bg-warning hover:bg-warning/90 text-white" },
  info: { icon: "text-primary bg-primary/10", button: "bg-primary hover:bg-primary/90 text-white" },
};

export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", variant = "danger" }: ConfirmModalProps) {
  const styles = variantStyles[variant];
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl shrink-0 ${styles.icon}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { onConfirm(); onClose(); }} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${styles.button}`}>{confirmLabel}</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
