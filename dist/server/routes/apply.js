import { Router } from "express";
import nodemailer from "nodemailer";
import multer from "multer";
import fetch from "node-fetch";
import path from "path";
const upload = multer();
const router = Router();
router.post("/", upload.single("resume"), async (req, res) => {
    try {
        const { name, email, phone, linkedin, message, positionTitle, positionDepartment, resumeUrl } = req.body;
        if (!name || !email || !message || !positionTitle)
            return res.status(400).json({ error: "Missing required fields" });
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const recipientEmail = process.env.CAREERS_EMAIL || smtpUser;
        if (!smtpUser || !smtpPass)
            return res.status(500).json({ error: "Email service not configured" });
        const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: smtpUser, pass: smtpPass } });
        try {
            await transporter.verify();
        }
        catch (e) {
            console.error(e);
            return res.status(500).json({ error: "SMTP verification failed" });
        }
        let attachments = [];
        if (req.file && req.file.buffer) {
            attachments.push({ filename: req.file.originalname || "resume", content: req.file.buffer });
        }
        else if (resumeUrl) {
            try {
                const r = await fetch(resumeUrl);
                if (r.ok) {
                    const buffer = Buffer.from(await r.arrayBuffer());
                    attachments.push({ filename: path.basename(resumeUrl), content: buffer });
                }
            }
            catch (e) {
                console.warn("Could not fetch resume url", e);
            }
        }
        const emailHtml = `<p>Application for ${positionTitle}</p><p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`;
        await transporter.sendMail({ from: smtpUser, to: recipientEmail, subject: `New Application: ${positionTitle} - ${name}`, html: emailHtml, attachments });
        res.json({ success: true, message: "Application submitted successfully" });
    }
    catch (err) {
        console.error("Apply API error:", err);
        res.status(500).json({ error: "Failed to submit application" });
    }
});
export default router;
//# sourceMappingURL=apply.js.map