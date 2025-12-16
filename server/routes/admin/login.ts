import { Router } from "express";
import { prisma } from "../../../src/lib/prisma.js";
import { loginSchema } from "../../../src/lib/validators.js";
import { verifyPassword, signAdminToken, setAdminCookie } from "../../../src/lib/auth.js";

const router = Router();

router.post("/", async (req, res) => {
  const body = req.body;
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid payload" });

  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await verifyPassword(parsed.data.password, admin.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAdminToken(admin.id);
  setAdminCookie(token, res);

  // Also return token in JSON so dev frontends that cannot set cross-site cookies
  // can store and use the token (less secure than httpOnly cookie).
  return res.json({
    admin: { id: admin.id, name: admin.name, email: admin.email },
    token,
  });
});

export default router;
