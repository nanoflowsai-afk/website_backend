import { Router, Request } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";
import { teamMemberSchema, teamMemberUpdateSchema } from "../../../src/lib/validators.js";

const router = Router();

function requireAdmin(req: Request) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return null;
  return adminId;
}

router.get("/", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const members = await prisma.teamMember.findMany({ orderBy: { displayOrder: "asc" } });
  res.json({ members });
});

router.post("/", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const parsed = teamMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });
  const member = await prisma.teamMember.create({ data: parsed.data });
  res.json({ member });
});

router.put("/:id", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const parsed = teamMemberUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });
  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });
  const member = await prisma.teamMember.update({ where: { id }, data: parsed.data as any });
  res.json({ member });
});

router.delete("/:id", async (req, res) => {
  const adminId = requireAdmin(req);
  if (!adminId) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  await prisma.teamMember.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
