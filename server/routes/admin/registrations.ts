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

// Update registration status
router.put("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const registrationId = parseInt(req.params.id);
        const { status } = req.body; // 'accepted', 'rejected'

        if (!['accepted', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const registration = await prisma.webinarRegistration.update({
            where: { id: registrationId },
            data: { status },
            include: { webinar: true, user: true }
        });

        // Send Notification if accepted
        if (status === 'accepted') {
            await prisma.notification.create({
                data: {
                    userId: registration.userId,
                    message: `Your registration for "${registration.webinar.title}" has been accepted!`,
                    type: 'success',
                    isRead: false
                }
            });
            
            // Optionally send email here as well (if email module is available)
        } else if (status === 'rejected') {
             await prisma.notification.create({
                data: {
                    userId: registration.userId,
                    message: `Your registration for "${registration.webinar.title}" has been declined.`,
                    type: 'error',
                    isRead: false
                }
            });
        }

        res.json({ registration });
    } catch (error) {
        console.error("Failed to update registration:", error);
        res.status(500).json({ error: "Failed to update registration" });
    }
});

export default router;
