import { NextRequest, NextResponse } from "next/server";

// Mock user credentials for local development (no Python backend needed)
const MOCK_USERS = [
  {
    email: "demo@plancraft.ai",
    password: "demo123",
    user: {
      id: "u1",
      name: "Demo User",
      email: "demo@plancraft.ai",
      role: "user",
      plan: "pro",
      createdAt: new Date().toISOString(),
      verified: true,
      aiCreditsUsed: 12,
      aiCreditsTotal: 100,
      storageUsedMb: 45,
      storageQuotaMb: 1024,
      projectsCount: 3,
    },
  },
  {
    email: "admin@plancraft.ai",
    password: "admin123",
    user: {
      id: "u2",
      name: "Admin User",
      email: "admin@plancraft.ai",
      role: "admin",
      plan: "enterprise",
      createdAt: new Date().toISOString(),
      verified: true,
      aiCreditsUsed: 5,
      aiCreditsTotal: 1000,
      storageUsedMb: 120,
      storageQuotaMb: 10240,
      projectsCount: 15,
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email and password are required." },
        { status: 400 }
      );
    }

    const match = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!match) {
      return NextResponse.json(
        { detail: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      access_token: `mock_access_token_${match.user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_token_${match.user.id}_${Date.now()}`,
      token_type: "bearer",
      user: match.user,
    });
  } catch {
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
