/**
 * GET /api/apk-qr
 *
 * Generates a QR code PNG (base64) pointing to the APK download URL.
 * Reads APK_DOWNLOAD_URL from the server environment — this value is never
 * sent to the browser directly, only the resulting QR image is.
 *
 * To set the APK URL later, add one line to .env:
 *   APK_DOWNLOAD_URL=https://example.com/plancraft.apk
 */

import { NextResponse } from "next/server";
import QRCode from "qrcode";

/** One-line change when the hosting location is finalised. */
const APK_DOWNLOAD_URL = process.env.APK_DOWNLOAD_URL ?? "";

export const dynamic = "force-dynamic"; // never cache — URL may change at any time

export async function GET() {
  if (!APK_DOWNLOAD_URL) {
    return NextResponse.json({ comingSoon: true });
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(APK_DOWNLOAD_URL, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#16243D",  // --navy (matches page theme)
        light: "#F3EFE6", // --paper
      },
    });

    return NextResponse.json({
      comingSoon: false,
      qr: qrDataUrl,
      url: APK_DOWNLOAD_URL,
    });
  } catch {
    // Graceful degradation — show "coming soon" rather than a broken UI
    return NextResponse.json({ comingSoon: true });
  }
}
