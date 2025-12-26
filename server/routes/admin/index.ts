import { Router } from "express";

import loginRouter from "./login.js";
import logoutRouter from "./logout.js";
import bootstrapRouter from "./bootstrap.js";
import heroSlidesRouter from "./hero-slides.js";
import aboutRouter from "./about.js";
import teamRouter from "./team-members.js";
import blogRouter from "./blog-posts.js";
import careersRouter from "./careers.js";
import webinarsRouter from "./webinars.js";
import registrationsRouter from "./registrations.js";
import aiToolsRouter from "./ai-tools.js";

const router = Router();

router.use("/login", loginRouter);
router.use("/logout", logoutRouter);
router.use("/bootstrap", bootstrapRouter);
router.use("/hero-slides", heroSlidesRouter);
router.use("/about", aboutRouter);
router.use("/team-members", teamRouter);
router.use("/blog-posts", blogRouter);
router.use("/careers", careersRouter);
router.use("/webinars", webinarsRouter);
router.use("/registrations", registrationsRouter);
import { adminProductRequestsRouter } from "./product-requests";

// ... previous routes
router.use("/ai-tools", aiToolsRouter);
router.use("/product-requests", adminProductRequestsRouter);

export default router;
