import { Router, Request } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";
import { blogPostSchema, blogPostUpdateSchema } from "../../../src/lib/validators.js";

const router = Router();

function requireAdmin(req: Request) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return null;
  return adminId;
}

router.get("/", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
  res.json({ posts });
});

router.post("/", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const parsed = blogPostSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const post = await prisma.blogPost.create({ data: parsed.data as any });
  res.json({ post });
});

router.put("/:id", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = blogPostUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });
  const post = await prisma.blogPost.update({ where: { id }, data: parsed.data as any });
  res.json({ post });
});

router.delete("/:id", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  await prisma.blogPost.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
