"use client";

import * as React from "react";

interface QRPayload {
  comingSoon: boolean;
  qr?: string;
  url?: string;
}

/**
 * AppDownloadCard
 *
 * Displays a "Get the PlanCraftAI App" panel that fetches a server-generated
 * QR code from /api/apk-qr.  The QR encodes APK_DOWNLOAD_URL (env var set
 * in .env).  If the env var is absent the card shows a "Coming soon" state.
 *
 * Styling relies on CSS class names defined in the login page's inline
 * <style> block — both are always on the same page so this is safe.
 */
export function AppDownloadCard() {
  const [payload, setPayload] = React.useState<QRPayload | null>(null);
  const [fetchError, setFetchError] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/apk-qr")
      .then((res) => {
        if (!res.ok) throw new Error("non-2xx");
        return res.json() as Promise<QRPayload>;
      })
      .then(setPayload)
      .catch(() => {
        setFetchError(true);
        setPayload({ comingSoon: true });
      });
  }, []);

  const isLoading = payload === null && !fetchError;
  const comingSoon = payload?.comingSoon ?? fetchError;

  return (
    <div className="app-dl-card">
      {/* Header */}
      <p className="card-eyebrow" style={{ marginBottom: "6px" }}>Mobile</p>
      <h3 className="app-dl-title">Get the PlanCraftAI App</h3>

      {/* QR area */}
      <div className="app-dl-qr-area">
        {isLoading && (
          <div className="app-dl-skeleton" aria-label="Loading QR code…" />
        )}

        {!isLoading && !comingSoon && payload?.qr && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={payload.qr}
            alt="QR code — scan to download the PlanCraftAI Android APK"
            className="app-dl-qr-img"
            width={180}
            height={180}
          />
        )}

        {!isLoading && comingSoon && (
          <div className="app-dl-soon-box" aria-label="Coming soon">
            {/* Phone + download icon */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--brass)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
              <polyline points="8 13 12 17 16 13" />
              <line x1="12" y1="8" x2="12" y2="17" />
            </svg>
            <span className="app-dl-soon-label">Coming soon</span>
          </div>
        )}
      </div>

      {/* Caption + links — shown only when QR is available */}
      {!comingSoon && payload?.qr && (
        <>
          <p className="app-dl-caption">Scan to download the Android app (APK)</p>

          {payload.url && (
            <a
              href={payload.url}
              className="app-dl-link"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="apk-direct-download-link"
            >
              Or download directly
            </a>
          )}

          <p className="app-dl-note">
            Enable &ldquo;Install from unknown sources&rdquo; if prompted
          </p>
        </>
      )}

      {/* Caption for coming-soon state */}
      {comingSoon && !isLoading && (
        <p className="app-dl-caption" style={{ marginTop: "10px" }}>
          Android app coming soon — stay tuned!
        </p>
      )}
    </div>
  );
}
