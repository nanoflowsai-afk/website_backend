import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// Get all AI Tools
router.get("/", async (req, res) => {
    try {
        const tools = await prisma.aiTool.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
        });
        res.json({ tools });
    } catch (error) {
        console.error("Error fetching AI tools:", error);
        res.status(500).json({ error: "Failed to fetch AI tools" });
    }
});

export default router;
