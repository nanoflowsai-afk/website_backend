import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { teamMemberUpdateSchema } from "@/lib/validators";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = teamMemberUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.teamMember.findUnique({ where: { id: numericId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const member = await prisma.teamMember.update({
    where: { id: numericId },
    data: {
      name: parsed.data.name ?? undefined,
      role: parsed.data.role ?? undefined,
      bio: parsed.data.bio ?? undefined,
      expertise: parsed.data.expertise ?? undefined,
      avatarUrl: parsed.data.avatarUrl ?? undefined,
      isActive: parsed.data.isActive ?? undefined,
      displayOrder: parsed.data.displayOrder ?? undefined,
    },
  });

  return NextResponse.json({ member });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.teamMember.findUnique({ where: { id: numericId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.teamMember.delete({
    where: { id: numericId },
  });

  return NextResponse.json({ success: true });
}

