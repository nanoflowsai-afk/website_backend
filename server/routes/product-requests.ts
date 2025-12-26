import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// POST /api/product-requests
router.post("/", async (req, res) => {
    try {
        const { name, email, idea } = req.body;

        if (!name || !email || !idea) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const request = await prisma.productRequest.create({
            data: {
                name,
                email,
                idea,
            },
        });

        res.status(201).json({ message: "Product request submitted successfully", request });
    } catch (error) {
        console.error("Error submitting product request:", error);
        res.status(500).json({ error: "Failed to submit request" });
    }
});

export const productRequestsRouter = router;
