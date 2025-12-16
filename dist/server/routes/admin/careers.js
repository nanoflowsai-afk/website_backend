import { Router } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";
import { jobPostingSchema, jobPostingUpdateSchema } from "../../../src/lib/validators.js";
const router = Router();
function requireAdmin(req) {
    const adminId = getAdminFromRequest(req);
    if (!adminId)
        return null;
    return adminId;
}
router.get("/", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const jobs = await prisma.jobPosting.findMany({ orderBy: { displayOrder: "asc" } });
    res.json({ jobs });
});
router.post("/", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const parsed = jobPostingSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    const job = await prisma.jobPosting.create({ data: parsed.data });
    res.json({ job });
});
router.put("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });
    const parsed = jobPostingUpdateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });
    const existing = await prisma.jobPosting.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ error: "Not found" });
    const job = await prisma.jobPosting.update({ where: { id }, data: parsed.data });
    res.json({ job });
});
router.delete("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });
    await prisma.jobPosting.delete({ where: { id } });
    res.json({ success: true });
});
export default router;
//# sourceMappingURL=careers.js.map