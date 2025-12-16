import { Router } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { bootstrapSchema } from "../../../src/lib/validators.js";
import { hashPassword, signAdminToken, setAdminCookie } from "../../../src/lib/auth.js";

const router = Router();

router.post("/", async (req, res) => {
  const body = req.body;
  const parsed = bootstrapSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  // Only allow bootstrapping when no admins exist
  const existing = await prisma.admin.findFirst();
  if (existing) return res.status(400).json({ error: "Already bootstrapped" });

  const bootstrapKey = process.env.ADMIN_BOOTSTRAP_KEY;
  if (bootstrapKey && parsed.data.key !== bootstrapKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const hashed = await hashPassword(parsed.data.password);
  const admin = await prisma.admin.create({
    data: { name: parsed.data.name, email: parsed.data.email, password: hashed },
  });

  const token = signAdminToken(admin.id);
  setAdminCookie(token, res);

  return res.json({ admin: { id: admin.id, name: admin.name, email: admin.email } });
});

export default router;
