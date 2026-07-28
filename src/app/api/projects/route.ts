import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: decoded.userId },
      include: {
        rooms: true,
        materials: true,
        costEstimate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (err: any) {
    console.error("Fetch Projects Error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
    }

    const data = await req.json();

    const newProject = await prisma.project.create({
      data: {
        name: data.name || "New Project",
        description: data.description || "",
        userId: decoded.userId,
        plotLength: data.plotLength || 60,
        plotWidth: data.plotWidth || 40,
        facing: data.facing || "North",
        floors: data.floors || 1,
        budgetTier: data.budgetTier || "Standard",
        style: data.style || "Modern",
        vastu: data.vastu ?? true,
        status: data.status || "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      include: {
        rooms: true,
        materials: true,
        costEstimate: true,
      }
    });

    return NextResponse.json({ project: newProject });
  } catch (err: any) {
    console.error("Create Project Error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
