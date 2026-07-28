"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const { signup, isLoading } = useAuthStore();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email address";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    const fullName = firstName.trim() + " " + lastName.trim();
    const success = await signup(fullName, email.trim(), password);
    if (success) {
      window.location.href = "/workspace";
    } else {
      setError("Signup failed. The email may already be registered.");
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-slate-500 text-sm mb-8">
        Start designing with AI-powered floor plans.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-danger bg-danger/10 rounded-xl border border-danger/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="John"
            icon={<User className="w-4 h-4" />}
            value={firstName}
            name="firstName"
            onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: "" })); }}
            error={fieldErrors.firstName}
            autoComplete="given-name"
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Doe"
            name="lastName"
            value={lastName}
            onChange={(e) => { setLastName(e.target.value); }}
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="hello@example.com"
          icon={<Mail className="w-4 h-4" />}
          name="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
          error={fieldErrors.email}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            icon={<Lock className="w-4 h-4" />}
            name="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
            error={fieldErrors.password}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-slate-400 hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          {!isLoading && "Create Account"}
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </Button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-xs text-slate-400 text-center mt-4 leading-relaxed">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>
    </>
  );
}
