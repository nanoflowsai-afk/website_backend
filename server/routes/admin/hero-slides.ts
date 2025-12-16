import { Router, Request } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";
import { heroSlideSchema, heroSlideUpdateSchema } from "../../../src/lib/validators.js";

const router = Router();

function requireAdmin(req: Request) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return null;
  return adminId;
}

router.get("/", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const slides = await prisma.heroSlide.findMany({ orderBy: { displayOrder: "asc" } });
  res.json({ slides });
});

router.post("/", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const parsed = heroSlideSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const slide = await prisma.heroSlide.create({ data: {
    heading: parsed.data.heading,
    subHeading: parsed.data.subHeading,
    tags: parsed.data.tags,
    backgroundImageUrl: parsed.data.backgroundImageUrl,
    isActive: parsed.data.isActive ?? true,
    displayOrder: parsed.data.displayOrder ?? 0,
  }});

  res.json({ slide });
});

router.get("/:id", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) return res.status(404).json({ error: "Not found" });
  res.json({ slide });
});

router.put("/:id", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = heroSlideUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });

  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const slide = await prisma.heroSlide.update({ where: { id }, data: {
    heading: parsed.data.heading ?? undefined,
    subHeading: parsed.data.subHeading ?? undefined,
    tags: parsed.data.tags ?? undefined,
    backgroundImageUrl: parsed.data.backgroundImageUrl ?? undefined,
    isActive: parsed.data.isActive ?? undefined,
    displayOrder: parsed.data.displayOrder ?? undefined,
  }});

  res.json({ slide });
});

router.delete("/:id", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });
  await prisma.heroSlide.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
