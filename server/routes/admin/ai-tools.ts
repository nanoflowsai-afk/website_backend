
import express from "express";
import { prisma } from "../../lib/prisma";

const router = express.Router();

// Get all tools (Admin view)
router.get("/", async (req, res) => {
    try {
        const tools = await prisma.aiTool.findMany({
            orderBy: { displayOrder: "asc" },
        });
        res.json({ tools });
    } catch (error) {
        console.error("Error fetching AI tools (Admin):", error);
        res.status(500).json({ error: "Failed to fetch AI tools" });
    }
});

// Get single tool
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const tool = await prisma.aiTool.findUnique({
            where: { id: Number(id) },
        });
        if (!tool) {
            return res.status(404).json({ error: "Tool not found" });
        }
        res.json({ tool });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tool" });
    }
});

// Create tool
router.post("/", async (req, res) => {
    try {
        const { name, description, category, pricing, websiteUrl, imageUrl, isActive, displayOrder } = req.body;
        const newTool = await prisma.aiTool.create({
            data: {
                name,
                description,
                category,
                pricing,
                websiteUrl,
                imageUrl,
                isActive: isActive ?? true,
                displayOrder: displayOrder ?? 0,
            },
        });
        res.json({ tool: newTool });
    } catch (error) {
        console.error("Error creating tool:", error);
        res.status(500).json({ error: "Failed to create tool" });
    }
});

// Update tool
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, pricing, websiteUrl, imageUrl, isActive, displayOrder } = req.body;

        const updatedTool = await prisma.aiTool.update({
            where: { id: Number(id) },
            data: {
                name,
                description,
                category,
                pricing,
                websiteUrl,
                imageUrl,
                isActive,
                displayOrder,
            },
        });
        res.json({ tool: updatedTool });
    } catch (error) {
        console.error("Error updating tool:", error);
        res.status(500).json({ error: "Failed to update tool" });
    }
});

// Delete tool
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.aiTool.delete({
            where: { id: Number(id) },
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting tool:", error);
        res.status(500).json({ error: "Failed to delete tool" });
    }
});

export default router;
