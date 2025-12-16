import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { heroSlideUpdateSchema } from "@/lib/validators";

function requireAdmin(req: NextRequest) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) {
    return null;
  }
  return adminId;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const adminId = requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await Promise.resolve(context.params);
  const slideId = Number(resolved.id);
  if (Number.isNaN(slideId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const slide = await prisma.heroSlide.findUnique({
    where: { id: slideId },
  });

  if (!slide) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ slide });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const adminId = requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await Promise.resolve(context.params);
  const slideId = Number(resolved.id);
  if (Number.isNaN(slideId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = heroSlideUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = await prisma.heroSlide.findUnique({ where: { id: slideId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slide = await prisma.heroSlide.update({
    where: { id: slideId },
    data: {
      heading: parsed.data.heading ?? undefined,
      subHeading: parsed.data.subHeading ?? undefined,
      tags: parsed.data.tags ?? undefined,
      backgroundImageUrl: parsed.data.backgroundImageUrl ?? undefined,
      isActive: parsed.data.isActive ?? undefined,
      displayOrder: parsed.data.displayOrder ?? undefined,
    },
  });

  return NextResponse.json({ slide });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const adminId = requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolved = await Promise.resolve(context.params);
  const slideId = Number(resolved.id);
  if (Number.isNaN(slideId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await prisma.heroSlide.findUnique({ where: { id: slideId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.heroSlide.delete({
    where: { id: slideId },
  });

  return NextResponse.json({ success: true });
}

