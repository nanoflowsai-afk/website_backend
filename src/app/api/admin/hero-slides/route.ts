import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { heroSlideSchema } from "@/lib/validators";

function requireAdmin(req: NextRequest) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) {
    return null;
  }
  return adminId;
}

export async function GET(req: NextRequest) {
  const adminId = requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slides = await prisma.heroSlide.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json({ slides });
}

export async function POST(req: NextRequest) {
  const adminId = requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = heroSlideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const slide = await prisma.heroSlide.create({
    data: {
      heading: parsed.data.heading,
      subHeading: parsed.data.subHeading,
      tags: parsed.data.tags,
      backgroundImageUrl: parsed.data.backgroundImageUrl,
      isActive: parsed.data.isActive ?? true,
      displayOrder: parsed.data.displayOrder ?? 0,
    },
  });

  return NextResponse.json({ slide });
}

