import { Router } from "express";
import { clearAdminCookie } from "../../../src/lib/auth.js";

const router = Router();

router.post("/", async (req, res) => {
  clearAdminCookie(res);
  return res.json({ success: true });
});

export default router;
