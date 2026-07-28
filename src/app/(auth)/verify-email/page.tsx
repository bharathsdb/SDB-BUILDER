"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";

export default function VerifyEmailPage() {
  const [resent, setResent] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);

  const handleResend = async () => {
    setIsResending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-primary" />
      </div>

      <h2 className="text-3xl font-bold mb-2">Verify your email</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-2">
        We&apos;ve sent a verification link to your email address.
      </p>
      <p className="text-sm text-slate-400 mb-8">
        Please check your inbox and click the verification link to activate your account.
      </p>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-slate-500">Verification email sent</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="text-sm text-slate-500">Email verified</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="text-sm text-slate-500">Redirecting to dashboard</span>
        </div>
      </div>

      <button
        onClick={handleResend}
        disabled={isResending}
        className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all inline-flex items-center justify-center gap-2 mb-4"
      >
        <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
        {isResending ? "Sending..." : resent ? "Sent!" : "Resend Verification"}
      </button>

      {resent && (
        <div className="flex items-center justify-center gap-2 text-sm text-success mb-4">
          <CheckCircle2 className="w-4 h-4" />
          Verification email resent!
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
        <Link href="/" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
          Back to home
        </Link>
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
          Go to dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
