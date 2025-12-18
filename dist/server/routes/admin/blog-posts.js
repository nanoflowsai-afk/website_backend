import { Router } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";
import { blogPostSchema, blogPostUpdateSchema } from "../../../src/lib/validators.js";
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
    const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
    res.json({ posts });
});
router.post("/", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const parsed = blogPostSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    // Normalize publishedAt from datetime-local string (e.g. "2025-12-16T11:56")
    // into a proper Date or null for Prisma.
    let publishedAt = undefined;
    if (parsed.data.publishedAt !== undefined && parsed.data.publishedAt !== null) {
        const raw = parsed.data.publishedAt;
        if (raw === "") {
            publishedAt = null;
        }
        else {
            const withSeconds = raw.length === 16 ? `${raw}:00` : raw;
            publishedAt = new Date(withSeconds);
        }
    }
    const post = await prisma.blogPost.create({
        data: {
            ...parsed.data,
            ...(publishedAt !== undefined ? { publishedAt } : {}),
        },
    });
    res.json({ post });
});
router.put("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });
    const parsed = blogPostUpdateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ error: "Not found" });
    // Normalize optional publishedAt on update
    let publishedAtUpdate = undefined;
    if (Object.prototype.hasOwnProperty.call(parsed.data, "publishedAt")) {
        const raw = parsed.data.publishedAt;
        if (raw === undefined) {
            publishedAtUpdate = undefined;
        }
        else if (raw === null || raw === "") {
            publishedAtUpdate = null;
        }
        else {
            const withSeconds = raw.length === 16 ? `${raw}:00` : raw;
            publishedAtUpdate = new Date(withSeconds);
        }
    }
    const updateData = {
        ...parsed.data,
    };
    if (publishedAtUpdate !== undefined) {
        updateData.publishedAt = publishedAtUpdate;
    }
    const post = await prisma.blogPost.update({ where: { id }, data: updateData });
    res.json({ post });
});
router.delete("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });
    await prisma.blogPost.delete({ where: { id } });
    res.json({ success: true });
});
export default router;
//# sourceMappingURL=blog-posts.js.map