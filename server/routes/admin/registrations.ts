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

            // Trigger Webhook for Approval
            try {
                // Using global fetch (Node 18+)
                await fetch("https://qwertdfdf.app.n8n.cloud/webhook-test/approve-payment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        registrationId: registration.id,
                        user: {
                            id: registration.user.id,
                            name: registration.user.name,
                            email: registration.user.email,
                            headline: registration.user.headline
                        },
                        webinar: {
                            id: registration.webinar.id,
                            title: registration.webinar.title,
                            date: registration.webinar.date,
                            time: registration.webinar.time
                        },
                        status: registration.status,
                        paymentStatus: registration.paymentStatus,
                        registeredAt: registration.registeredAt
                    })
                });
            } catch (webhookError) {
                console.error("Approval webhook failed", webhookError);
                // Non-blocking
            }

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
