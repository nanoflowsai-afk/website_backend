import { Router } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";
import { aboutSchema } from "../../../src/lib/validators.js";
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
    const about = await prisma.about.findFirst();
    res.json({ about });
});
router.post("/", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const parsed = aboutSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid payload" });
    const existing = await prisma.about.findFirst();
    if (existing) {
        const updated = await prisma.about.update({ where: { id: existing.id }, data: parsed.data });
        return res.json({ about: updated });
    }
    const about = await prisma.about.create({ data: parsed.data });
    res.json({ about });
});
// Support PUT for clients that expect an idempotent update endpoint
router.put("/", async (req, res) => {
    var _a, _b;
    const adminId = requireAdmin(req);
    if (!adminId)
        return res.status(401).json({ error: "Unauthorized" });
    const parsed = aboutSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload" });
    }
    const existing = await prisma.about.findFirst();
    const about = existing
        ? await prisma.about.update({
            where: { id: existing.id },
            data: {
                mission: parsed.data.mission,
                vision: parsed.data.vision,
                teamIntro: (_a = parsed.data.teamIntro) !== null && _a !== void 0 ? _a : "",
                expertise: parsed.data.expertise,
                coreValues: parsed.data.coreValues,
            },
        })
        : await prisma.about.create({
            data: {
                mission: parsed.data.mission,
                vision: parsed.data.vision,
                teamIntro: (_b = parsed.data.teamIntro) !== null && _b !== void 0 ? _b : "",
                expertise: parsed.data.expertise,
                coreValues: parsed.data.coreValues,
            },
        });
    res.json({ about });
});
export default router;
//# sourceMappingURL=about.js.map