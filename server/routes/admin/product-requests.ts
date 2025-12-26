import express from "express";
import { prisma } from "../../lib/prisma";

const router = express.Router();

// GET /api/admin/product-requests
router.get("/", async (req, res) => {
    try {
        const requests = await prisma.productRequest.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json({ requests });
    } catch (error) {
        console.error("Error fetching product requests:", error);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
});

// PUT /api/admin/product-requests/:id - Update status
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await prisma.productRequest.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.json({ message: "Status updated", request });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ error: "Failed to update status" });
    }
});

// DELETE /api/admin/product-requests/:id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.productRequest.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: "Request deleted successfully" });
    } catch (error) {
        console.error("Error deleting request:", error);
        res.status(500).json({ error: "Failed to delete request" });
    }
});

export const adminProductRequestsRouter = router;
