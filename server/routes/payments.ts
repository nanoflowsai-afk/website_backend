import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const router = Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Create Order
router.post("/create-order", async (req, res) => {
    try {
        const { webinarId, userId } = req.body;

        if (!webinarId || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const webinar = await prisma.webinar.findUnique({
            where: { id: webinarId }
        });

        if (!webinar) {
            return res.status(404).json({ error: "Webinar not found" });
        }

        if ((webinar as any).price <= 0) {
            return res.status(400).json({ error: "This webinar is free" });
        }

        const amount = (webinar as any).price * 100;
        const currency = (webinar as any).currency || "INR";

        console.log("Creating Razorpay Order:", { amount, currency, webinarId });

        const options = {
            amount: amount,
            currency: currency,
            receipt: `receipt_${webinarId}_${userId}_${Date.now().toString().slice(-4)}`,
        };

        const order = await razorpay.orders.create(options);

        // Ideally, do NOT create registration yet, or create with PENDING_PAYMENT status
        // But for simplicity with existing architecture, we'll return order details
        // and create registration only on successful payment verification or specifically here with 'payment pending'

        res.json(order);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// Verify Payment and Register
router.post("/verify", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            webinarId,
            userId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment Success
            // Check if already registered
            const existing = await prisma.webinarRegistration.findUnique({
                where: {
                    userId_webinarId: {
                        userId: parseInt(userId),
                        webinarId: parseInt(webinarId)
                    }
                }
            });

            if (existing) {
                // If it was failed/pending, update it
                const updated = await prisma.webinarRegistration.update({
                    where: { id: existing.id },
                    data: {
                        paymentStatus: "SUCCESS",
                        razorpayOrderId: razorpay_order_id,
                        razorpayPaymentId: razorpay_payment_id,
                        status: "pending" // Approval needed
                    } as any
                });
                return res.json({ message: "Payment successful, registration updated", registration: updated });
            }

            // Create Registration
            const registration = await prisma.webinarRegistration.create({
                data: {
                    userId: parseInt(userId),
                    webinarId: parseInt(webinarId),
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    paymentStatus: "SUCCESS",
                    status: "pending" // Still requires admin approval? Or auto-approve if paid? 
                    // Plan said: "approval required"
                } as any
            });

            // Update count
            await prisma.webinar.update({
                where: { id: parseInt(webinarId) },
                data: { registeredCount: { increment: 1 } }
            });

            res.json({ message: "Payment verified and registered", registration });

        } else {
            res.status(400).json({ error: "Invalid signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
