"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const { resetPassword, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await resetPassword(email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Check your email</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          We&apos;ve sent a password reset link to <strong className="text-foreground">{email}</strong>
        </p>
        <p className="text-sm text-slate-400 mb-8">Didn&apos;t receive the email? Check your spam folder or try again.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Use a different email
        </button>
        <div className="mt-4">
          <Link href="/" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <h2 className="text-3xl font-bold mb-2">Forgot password?</h2>
        <p className="text-slate-500 dark:text-slate-400">No worries, we&apos;ll send you reset instructions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all mt-4 inline-flex items-center justify-center gap-2"
        >
          {isLoading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          Send Reset Link
        </button>
      </form>
    </>
  );
}
