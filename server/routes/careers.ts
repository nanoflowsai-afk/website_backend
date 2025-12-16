import { Router } from "express";
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
    const jobs = await prisma.jobPosting.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });

    const parsedJobs = jobs.map((job) => ({
      ...job,
      requirements: parseJsonField(job.requirements),
    }));

    res.json({ jobs: parsedJobs });
  } catch (err) {
    console.error("Error fetching careers:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
