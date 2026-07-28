"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Eye, EyeOff } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, googleLogin, isLoading: storeLoading } = useAuthStore();

  const [userId, setUserId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [userIdError, setUserIdError] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  
  const [serverError, setServerError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // This page is always client-rendered ('use client'), so isMounted is always true.
  const isMounted = true;

  // Clear any stored session once when visiting the login page — use a ref
  // so it only runs once and never triggers a re-render.
  const didLogout = React.useRef(false);
  React.useEffect(() => {
    if (!didLogout.current) {
      didLogout.current = true;
      useAuthStore.getState().logout();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    let hasError = false;
    if (!userId.trim()) {
      setUserIdError("User ID is required.");
      hasError = true;
    } else {
      setUserIdError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    setServerError("");
    setIsSubmitting(true);

    try {
      // Use existing auth store which hits the FastAPI endpoint and handles the JWT
      const success = await login(userId, password);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => router.push("/dashboard"), 500);
      } else {
        setServerError("Invalid ID or password.");
      }
    } catch (err: any) {
      setServerError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setServerError("");
      setIsSubmitting(true);
      try {
        const success = await googleLogin(credentialResponse.credential);
        if (success) {
          setIsSuccess(true);
          setTimeout(() => router.push("/dashboard"), 500);
        } else {
          setServerError("Google Sign-in failed.");
        }
      } catch (err: any) {
        setServerError(err.message || "Something went wrong with Google Sign-in.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // We no longer automatically hide the page if isAuthenticated
  if (isMounted && isSuccess) return null;

  const busy = isSubmitting || storeLoading;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="brand">PlanCraftAI</div>
            <h2>Welcome Back</h2>
            <p>Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <div className={`form-group ${userIdError ? "has-error" : ""}`}>
              <label htmlFor="userId">User ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                placeholder="Enter your user ID (email)"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setUserIdError("");
                  setServerError("");
                }}
                disabled={busy}
                suppressHydrationWarning
              />
              {userIdError && <span className="error-text">{userIdError}</span>}
            </div>

            <div className={`form-group ${passwordError ? "has-error" : ""}`}>
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                    setServerError("");
                  }}
                  disabled={busy}
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <span className="error-text">{passwordError}</span>}
            </div>

            {serverError && (
              <div className="server-error-box">
                {serverError}
              </div>
            )}

            <button type="submit" className="login-submit-btn" disabled={busy}>
              {busy ? "Signing in..." : isSuccess ? "Success!" : "Login"}
            </button>
            
            <div className="divider">
              <span>OR</span>
            </div>
            
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setServerError("Google Sign-in was unsuccessful.");
                }}
              />
            </div>
          </form>
        </div>
      </div>
      </GoogleOAuthProvider>
    </>
  );
}

// ── Simple Centered Styling ──────────────────────────────────────────────────
const CSS = `
:root {
  --navy: #16243D;
  --paper: #F3EFE6;
  --brass: #B8863B;
  --error: #A6432F;
  --border: #E5E7EB;
  --text-main: #1C1C1A;
  --text-muted: #6B7280;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #F9FAFB;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.02);
  padding: 40px 32px;
  box-sizing: border-box;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.brand {
  font-size: 24px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.login-header h2 {
  margin: 0 0 8px;
  color: var(--text-main);
  font-size: 20px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.form-group input:focus {
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(22, 36, 61, 0.1);
}

.has-error input {
  border-color: var(--error);
}

.has-error input:focus {
  box-shadow: 0 0 0 3px rgba(166, 67, 47, 0.1);
}

.error-text {
  color: var(--error);
  font-size: 12px;
  font-weight: 500;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.toggle-password:hover {
  color: var(--text-main);
}

.server-error-box {
  background-color: #FEF2F2;
  border: 1px solid #F87171;
  color: #B91C1C;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  font-weight: 500;
}

.login-submit-btn {
  background-color: var(--navy);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 8px;
}

.login-submit-btn:hover:not(:disabled) {
  background-color: var(--navy-deep, #0A1220);
}

.login-submit-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.login-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin: 10px 0;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--border);
}

.divider span {
  padding: 0 10px;
}

.google-login-wrapper {
  display: flex;
  justify-content: center;
}
`;
