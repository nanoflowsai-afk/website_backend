import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aboutSchema } from "@/lib/validators";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const about = await prisma.about.findFirst();
  return NextResponse.json({ about });
}

export async function PUT(req: NextRequest) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = aboutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.about.findFirst();
  const record = existing
    ? await prisma.about.update({
        where: { id: existing.id },
        data: {
          mission: parsed.data.mission,
          vision: parsed.data.vision,
          teamIntro: parsed.data.teamIntro ?? "",
          expertise: parsed.data.expertise,
          coreValues: parsed.data.coreValues,
        },
      })
    : await prisma.about.create({
        data: {
          mission: parsed.data.mission,
          vision: parsed.data.vision,
          teamIntro: parsed.data.teamIntro ?? "",
          expertise: parsed.data.expertise,
          coreValues: parsed.data.coreValues,
        },
      });

  return NextResponse.json({ about: record });
}

