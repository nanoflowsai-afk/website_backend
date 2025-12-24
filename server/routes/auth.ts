import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../src/lib/prisma.js";
import { userLoginSchema, userSignupSchema } from "../../src/lib/validators.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not set - authentication will fail without it");
}

const ADMIN_TOKEN_NAME = "nano_admin_token";

router.post("/login", async (req, res) => {
  const body = req.body;
  const parsed = userLoginSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  try {
    const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
    if (admin) {
      const valid = await bcrypt.compare(parsed.data.password, admin.password);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });
      const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie(ADMIN_TOKEN_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 * 1000,
      });
      return res.json({ admin: { id: admin.id, name: admin.name, email: admin.email }, role: "admin" });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(parsed.data.password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ adminId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie(ADMIN_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.json({ user: { id: user.id, name: user.name, email: user.email }, role: "user" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  const body = req.body;
  const parsed = userSignupSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  try {
    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashed,
      },
    });

    const token = jwt.sign({ adminId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie(ADMIN_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 * 1000,
    });

    return res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
