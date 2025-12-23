import { Router, Request } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { getAdminFromRequest } from "../../../src/lib/auth.js";

const router = Router();

function requireAdmin(req: Request) {
    const adminId = getAdminFromRequest(req);
    if (!adminId) return null;
    return adminId;
}

// Get all webinars (Admin view)
router.get("/", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const webinars = await (prisma as any).webinar.findMany({
            orderBy: { createdAt: "desc" },
            include: { roadmapItems: true }
        });
        res.json({ webinars });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch webinars" });
    }
});

// Create webinar
router.post("/", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const {
            title, description, date, time, duration, speaker,
            level, category, type, imageUrl, maxCapacity, isLandingPage,
            notificationActive, notificationText, heroTitle, heroSubtitle,
            heroContext, heroImage, platform, mentorName, mentorRole,
            mentorImage, mentorBio, roadmapItems
        } = req.body;

        const webinar = await (prisma as any).webinar.create({
            data: {
                title, description, date, time, duration, speaker,
                level, category, type, imageUrl,
                maxCapacity: Number(maxCapacity) || 100,
                isLandingPage: Boolean(isLandingPage),
                notificationActive: Boolean(notificationActive),
                notificationText,
                heroTitle, heroSubtitle, heroContext, heroImage,
                platform,
                mentorName, mentorRole, mentorImage, mentorBio,
                roadmapItems: roadmapItems ? {
                    create: roadmapItems.map((item: any) => ({
                        day: item.day,
                        title: item.title,
                        subtitle: item.subtitle,
                        highlight: item.highlight,
                        description: item.description, // Array of strings is supported by our schema update
                        imageUrl: item.imageUrl
                    }))
                } : undefined
            },
        });

        res.status(201).json({ webinar });
    } catch (error) {
        console.error("Create Webinar Error:", error);
        res.status(500).json({ error: "Failed to create webinar" });
    }
});

// Update webinar
router.put("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { id } = req.params;
        const {
            roadmapItems, id: _bodyId, createdAt, updatedAt,
            ...rest
        } = req.body;

        // Ensure numbers are numbers
        if (rest.maxCapacity) rest.maxCapacity = Number(rest.maxCapacity);
        if (rest.isLandingPage !== undefined) rest.isLandingPage = Boolean(rest.isLandingPage);
        if (rest.notificationActive !== undefined) rest.notificationActive = Boolean(rest.notificationActive);

        const updateData: any = { ...rest };

        // Use transaction to ensure clean state
        await (prisma as any).$transaction(async (tx: any) => {
            if (roadmapItems && Array.isArray(roadmapItems)) {
                // Explicitly delete all existing roadmap items for this webinar
                await tx.webinarRoadmapItem.deleteMany({
                    where: { webinarId: Number(id) }
                });

                // Set up creation of new items
                updateData.roadmapItems = {
                    create: roadmapItems.map((item: any) => ({
                        day: item.day,
                        title: item.title,
                        subtitle: item.subtitle,
                        highlight: item.highlight,
                        description: item.description,
                        imageUrl: item.imageUrl
                    }))
                };
            }

            // Update the webinar
            await tx.webinar.update({
                where: { id: Number(id) },
                data: updateData,
            });
        });

        // Fetch updated webinar to return
        const webinar = await (prisma as any).webinar.findUnique({
            where: { id: Number(id) },
            include: { roadmapItems: true }
        });
        res.json({ webinar });
    } catch (error) {
        console.error("Update Webinar Error:", error);
        res.status(500).json({ error: "Failed to update webinar" }); // Return 500 but log error
    }
});

// Delete webinar
router.delete("/:id", async (req, res) => {
    const adminId = requireAdmin(req);
    if (!adminId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const { id } = req.params;
        await (prisma as any).webinar.delete({
            where: { id: Number(id) },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete webinar" });
    }
});

export default router;
