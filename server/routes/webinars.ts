import { Router } from "express";
import { prisma } from "../../src/lib/prisma.js";

const router = Router();

// Get all webinars
router.get("/", async (req, res) => {
    try {
        const webinars = await prisma.webinar.findMany({
            orderBy: { createdAt: "desc" },
            include: { roadmapItems: true }
        });
        res.json({ webinars });
    } catch (error) {
        console.error("Error fetching webinars:", error);
        res.status(500).json({ error: "Failed to fetch webinars" });
    }
});

// Get single webinar by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const webinar = await prisma.webinar.findUnique({
            where: { id: parseInt(id) },
            include: { roadmapItems: { orderBy: { day: 'asc' } } }
        });

        if (!webinar) {
            return res.status(404).json({ error: "Webinar not found" });
        }

        res.json({ webinar });
    } catch (error) {
        console.error("Error fetching webinar:", error);
        res.status(500).json({ error: "Failed to fetch webinar" });
    }
});

// Create new webinar
router.post("/", async (req, res) => {
    try {
        const { roadmapItems, ...webinarData } = req.body;

        // Handle roadmap items if present
        const createData = {
            ...webinarData,
            roadmapItems: roadmapItems ? {
                create: roadmapItems.map((item: any) => ({
                    day: item.day,
                    title: item.title,
                    subtitle: item.subtitle,
                    highlight: item.highlight,
                    description: item.description, // JSON array
                    imageUrl: item.imageUrl
                }))
            } : undefined
        };

        const newWebinar = await prisma.webinar.create({
            data: createData,
            include: { roadmapItems: true }
        });

        res.status(201).json({ webinar: newWebinar });
    } catch (error) {
        console.error("Error creating webinar:", error);
        res.status(500).json({ error: "Failed to create webinar" });
    }
});

// Update webinar
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { roadmapItems, ...webinarData } = req.body;

        // If roadmap items are provided, delete existing and create new (simplest strategy for now)
        // Or we could try upsert, but delete-create is safer for reordering/removal

        let updateData: any = { ...webinarData };

        if (roadmapItems) {
            updateData.roadmapItems = {
                deleteMany: {},
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

        const updatedWebinar = await prisma.webinar.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { roadmapItems: { orderBy: { day: 'asc' } } }
        });

        res.json({ webinar: updatedWebinar });
    } catch (error) {
        console.error("Error updating webinar:", error);
        res.status(500).json({ error: "Failed to update webinar" });
    }
});

// Delete webinar
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.webinar.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Webinar deleted successfully" });
    } catch (error) {
        console.error("Error deleting webinar:", error);
        res.status(500).json({ error: "Failed to delete webinar" });
    }
});

export default router;
