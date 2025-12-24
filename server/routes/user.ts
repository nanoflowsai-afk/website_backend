import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../../src/lib/prisma.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "";

// Middleware to check authentication
const checkAuth = async (req: any, res: any, next: any) => {
    const token = req.cookies?.nano_admin_token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { adminId: number };
        req.userId = decoded.adminId; // Reusing adminId as it seems to be the user ID in auth.ts
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
};

// Get User Profile
router.get("/", checkAuth, async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true,
                headline: true,
                bio: true,
                avatarUrl: true,
                createdAt: true
            }
        });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Update User Profile
router.put("/", checkAuth, async (req: any, res) => {
    try {
        const { name, headline, bio, avatarUrl, email, newPassword } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (headline !== undefined) updateData.headline = headline;
        if (bio !== undefined) updateData.bio = bio;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

        // Handle Password Update
        if (newPassword) {
            const user = await prisma.user.findUnique({ where: { id: req.userId } });
            if (!user) return res.status(404).json({ error: "User not found" });

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                headline: true,
                bio: true,
                avatarUrl: true
            }
        });

        res.json({ user });
    } catch (error: any) {
        console.error("Error updating profile:", error);
        // Handle unique constraint violation for email
        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(400).json({ error: "Email is already in use" });
        }
        res.status(500).json({ error: "Server error" });
    }
});

// Get User Registrations
router.get("/registrations", checkAuth, async (req: any, res) => {
    try {
        const registrations = await prisma.webinarRegistration.findMany({
            where: { userId: req.userId },
            include: {
                webinar: true
            },
            orderBy: { registeredAt: 'desc' }
        });

        // Format to match frontend expectations if needed, or send as is
        // Currently frontend expects flat webinar object with status
        const formattedRegistrations = registrations.map(reg => ({
            ...reg.webinar,
            status: reg.status,
            registrationId: reg.id,
            registeredAt: reg.registeredAt
        }));

        res.json({ registrations: formattedRegistrations });
    } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Register for a Webinar
router.post("/registrations/:webinarId", checkAuth, async (req: any, res) => {
    try {
        const webinarId = parseInt(req.params.webinarId);

        // Check if already registered
        const existing = await prisma.webinarRegistration.findUnique({
            where: {
                userId_webinarId: {
                    userId: req.userId,
                    webinarId
                }
            }
        });

        if (existing) {
            return res.status(400).json({ error: "Already registered for this webinar" });
        }

        const registration = await prisma.webinarRegistration.create({
            data: {
                userId: req.userId,
                webinarId
            }
        });

        // Update registered count
        const webinar = await prisma.webinar.update({
            where: { id: webinarId },
            data: { registeredCount: { increment: 1 } }
        });

        // Fetch User details for email
        const user = await prisma.user.findUnique({ where: { id: req.userId } });

        if (user && user.email) {
            console.log("User found, sending email to:", user.email);
            // Send confirmation email asynchronously
            // We use 'await' here to ensure it tries to send, but we could also fire-and-forget
            // However, usually better to wait to catch errors, but not block response too long.
            import("../../src/lib/email.js").then(async (emailModule) => {
                console.log("Email module loaded");
                const result = await emailModule.sendWebinarRegistrationEmail(
                    user.email,
                    user.name,
                    webinar.title,
                    webinar.date,
                    webinar.time
                );
                console.log("Email send result:", result);
            }).catch(err => console.error("Failed to load email module or send email", err));
        } else {
            console.log("User not found or no email, skipping email send");
        }

        res.json({ message: "Successfully registered", registration });
    } catch (error) {
        console.error("Error registering for webinar:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete User Account
router.delete("/", checkAuth, async (req: any, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.userId }
        });

        res.clearCookie("nano_admin_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
