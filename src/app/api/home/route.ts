import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseJsonField(field: unknown): string[] {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET() {
  const [slides, about, team, posts] = await Promise.all([
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.about.findFirst(),
    prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
  ]);

  const parsedSlides = slides.map((s) => ({
    ...s,
    tags: parseJsonField(s.tags),
  }));

  const parsedTeam = team.map((m) => ({
    ...m,
    expertise: parseJsonField(m.expertise),
  }));

  const parsedAbout = about ? {
    ...about,
    expertise: parseJsonField(about.expertise),
    coreValues: parseJsonField(about.coreValues),
  } : null;

  return NextResponse.json({
    slides: parsedSlides,
    about: parsedAbout,
    team: parsedTeam,
    posts,
  });
}

