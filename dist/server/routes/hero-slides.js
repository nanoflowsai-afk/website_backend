import { Router } from "express";
import { prisma } from "../..//src/lib/prisma.js";
const router = Router();
router.get("/", async (_req, res) => {
    const slides = await prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
    });
    res.json({ slides });
});
export default router;
//# sourceMappingURL=hero-slides.js.map