import { Router } from "express";
import nodemailer from "nodemailer";
import { z } from "zod";

const router = Router();

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(10),
});

router.post("/", async (req, res) => {
  const body = req.body;
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid form data", issues: parsed.error.issues });
  }

  const { firstName, lastName, email, phone, company, service, message } = parsed.data;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const contactEmail = process.env.CONTACT_EMAIL || "nanoflowsvizag@gmail.com";

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error("SMTP configuration missing");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e293b; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 140px;">Name:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${firstName} ${lastName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Phone:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${phone}</td>
        </tr>
        ` : ""}
        ${company ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Company:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${company}</td>
        </tr>
        ` : ""}
        ${service ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Service:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${service}</td>
        </tr>
        ` : ""}
      </table>
      <h3 style="color: #1e293b; margin-top: 20px;">Message:</h3>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
        ${message.replace(/\n/g, "<br>")}
      </div>
      <p style="margin-top: 20px; color: #64748b; font-size: 12px;">
        This message was sent from the NanoFlows website contact form.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: contactEmail,
      replyTo: email,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: htmlContent,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Email sending failed:", error);
    return res.status(500).json({ error: "Failed to send email. Please try again later." });
  }
});

export default router;
