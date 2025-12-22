import { Router } from "express";
import { Resend } from "resend";
import multer from "multer";
import fetch from "node-fetch";
import path from "path";

const upload = multer();
const router = Router();

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, linkedin, message, positionTitle, positionDepartment, resumeUrl } = req.body;
    if (!name || !email || !message || !positionTitle) return res.status(400).json({ error: "Missing required fields" });

    // Resend Configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is missing");
      return res.status(500).json({ error: "Email service not configured" });
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
    const recipientEmail = process.env.CAREERS_EMAIL || "nanoflowsvizag@gmail.com";

    let attachments: any[] = [];
    if (req.file && req.file.buffer) {
      attachments.push({ filename: req.file.originalname || "resume.pdf", content: req.file.buffer });
    } else if (resumeUrl) {
      try {
        const r = await fetch(resumeUrl as string);
        if (r.ok) {
          const buffer = Buffer.from(await r.arrayBuffer());
          attachments.push({ filename: path.basename(resumeUrl as string), content: buffer });
        }
      } catch (e) { console.warn("Could not fetch resume url", e); }
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Application for ${positionTitle}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>LinkedIn:</strong> ${linkedin || "N/A"}</p>
        <p><strong>Department:</strong> ${positionDepartment}</p>
        <h3>Message:</h3>
        <p>${message}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `New Application: ${positionTitle} - ${name}`,
      html: htmlContent,
      attachments,
      replyTo: email,
    });

    if (error) {
      console.error("Resend API error:", error);
      return res.status(500).json({ error: "Failed to submit application" });
    }

    res.json({ success: true, message: "Application submitted successfully", id: data?.id });
  } catch (err) {
    console.error("Apply API error:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

export default router;
