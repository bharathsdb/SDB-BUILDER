import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth-utils";

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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Note: In production, compare hashed passwords. Using raw for simple mock/demo DB.
    if (!user || user.password !== password) {
      return NextResponse.json(
        { detail: "Invalid email or password" },
        { status: 401 }
      );
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    
    // Omit sensitive data like password from returned user object
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      access_token: signToken(tokenPayload),
      refresh_token: signToken(tokenPayload, "30d"),
      token_type: "bearer",
      user: safeUser,
    });
  } catch (err: any) {
    console.error("Login Error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
