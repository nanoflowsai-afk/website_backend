import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json({ slides });
}

