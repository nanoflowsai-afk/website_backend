import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { teamMemberSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await prisma.teamMember.findMany({
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const member = await prisma.teamMember.create({
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      bio: parsed.data.bio,
      expertise: parsed.data.expertise,
      avatarUrl: parsed.data.avatarUrl ?? "",
      isActive: parsed.data.isActive ?? true,
      displayOrder: parsed.data.displayOrder ?? 0,
    },
  });

  return NextResponse.json({ member });
}

