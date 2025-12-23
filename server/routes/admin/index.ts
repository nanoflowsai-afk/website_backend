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

export default router;
