import { Router } from "express";
import { HeroSlide, TeamMember } from "@prisma/client";
import { prisma } from "../../src/lib/prisma.js";

const router = Router();

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

router.get("/", async (_req, res) => {
  try {
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

    const parsedSlides = slides.map((s: HeroSlide) => ({
      ...s,
      tags: parseJsonField(s.tags),
    }));

    const parsedTeam = team.map((m: TeamMember) => ({
      ...m,
      expertise: parseJsonField(m.expertise),
    }));

    const parsedAbout = about
      ? {
        ...about,
        expertise: parseJsonField(about.expertise),
        coreValues: parseJsonField(about.coreValues),
      }
      : null;

    res.json({ slides: parsedSlides, about: parsedAbout, team: parsedTeam, posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
