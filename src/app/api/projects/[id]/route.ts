import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-utils";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Check ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ detail: "Project not found" }, { status: 404 });
    }

    if (project.userId !== decoded.userId) {
      return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Project Error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const data = await req.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.userId !== decoded.userId) {
      return NextResponse.json({ detail: "Project not found or forbidden" }, { status: 404 });
    }

    // Filter out restricted fields (like userId)
    const { id, userId, ...updateData } = data;

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...updateData,
        updatedAt: new Date().toISOString()
      },
      include: {
        rooms: true,
        materials: true,
        costEstimate: true,
      }
    });

    return NextResponse.json({ project: updatedProject });
  } catch (err: any) {
    console.error("Update Project Error:", err);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
