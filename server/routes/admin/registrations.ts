import { Router, Request } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";

const router = Router();

function requireAdmin(req: Request) {
    const adminId = getAdminFromRequest(req);
    if (!adminId) return null;
    return adminId;
}

// Get all registrations, optionally filtered by webinarId
router.get("/", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { webinarId } = req.query;

        const whereClause: any = {};
        if (webinarId) {
            whereClause.webinarId = parseInt(webinarId as string);
        }

        const registrations = await prisma.webinarRegistration.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        headline: true
                    }
                },
                webinar: {
                    select: {
                        id: true,
                        title: true,
                        date: true,
                        time: true
                    }
                }
            },
            orderBy: { registeredAt: 'desc' }
        });

        res.json({ registrations });
    } catch (error) {
        console.error("Failed to fetch registrations:", error);
        res.status(500).json({ error: "Failed to fetch registrations" });
    }
});

export default router;
