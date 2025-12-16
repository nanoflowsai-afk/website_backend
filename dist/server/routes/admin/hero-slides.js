import { Router } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";
import { heroSlideSchema, heroSlideUpdateSchema } from "../../../src/lib/validators.js";
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
    const slides = await prisma.heroSlide.findMany({ orderBy: { displayOrder: "asc" } });
    res.json({ slides });
});
router.post("/", async (req, res) => {
    var _a, _b;
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const parsed = heroSlideSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    const slide = await prisma.heroSlide.create({ data: {
            heading: parsed.data.heading,
            subHeading: parsed.data.subHeading,
            tags: parsed.data.tags,
            backgroundImageUrl: parsed.data.backgroundImageUrl,
            isActive: (_a = parsed.data.isActive) !== null && _a !== void 0 ? _a : true,
            displayOrder: (_b = parsed.data.displayOrder) !== null && _b !== void 0 ? _b : 0,
        } });
    res.json({ slide });
});
router.get("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (!slide)
        return res.status(404).json({ error: "Not found" });
    res.json({ slide });
});
router.put("/:id", async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });
    const parsed = heroSlideUpdateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload", issues: parsed.error.issues });
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ error: "Not found" });
    const slide = await prisma.heroSlide.update({ where: { id }, data: {
            heading: (_a = parsed.data.heading) !== null && _a !== void 0 ? _a : undefined,
            subHeading: (_b = parsed.data.subHeading) !== null && _b !== void 0 ? _b : undefined,
            tags: (_c = parsed.data.tags) !== null && _c !== void 0 ? _c : undefined,
            backgroundImageUrl: (_d = parsed.data.backgroundImageUrl) !== null && _d !== void 0 ? _d : undefined,
            isActive: (_e = parsed.data.isActive) !== null && _e !== void 0 ? _e : undefined,
            displayOrder: (_f = parsed.data.displayOrder) !== null && _f !== void 0 ? _f : undefined,
        } });
    res.json({ slide });
});
router.delete("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid id" });
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing)
        return res.status(404).json({ error: "Not found" });
    await prisma.heroSlide.delete({ where: { id } });
    res.json({ success: true });
});
export default router;
//# sourceMappingURL=hero-slides.js.map