"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: "sans-serif", background: "#fee2e2", color: "#991b1b", minHeight: "100vh" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Something went wrong.</h1>
          <p style={{ fontWeight: "bold" }}>{this.state.error?.toString()}</p>
          <pre style={{ marginTop: "1rem", whiteSpace: "pre-wrap", fontSize: "0.875rem", background: "#fef2f2", padding: "1rem", borderRadius: "8px", overflow: "auto" }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#dc2626", color: "white", borderRadius: "4px", border: "none" }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
