import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const linkedin = formData.get("linkedin") as string;
    const message = formData.get("message") as string;
    const positionTitle = formData.get("positionTitle") as string;
    const positionDepartment = formData.get("positionDepartment") as string;
    const resumeUrl = formData.get("resumeUrl") as string;
    const resumeFile = formData.get("resume") as File | null;

    if (!name || !email || !message || !positionTitle) {
      return NextResponse.json(
        { error: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipientEmail = process.env.CAREERS_EMAIL || smtpUser;

    if (!smtpUser || !smtpPass) {
      console.error("SMTP credentials not configured. Set SMTP_USER and SMTP_PASS environment variables.");
      return NextResponse.json(
        { error: "Email service not configured. Please contact us directly.", success: false },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP verification failed:", verifyError);
      return NextResponse.json(
        { error: "Email service configuration error. Please contact us directly.", success: false },
        { status: 500 }
      );
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f97316, #fbbf24); padding: 20px; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { margin-top: 5px; color: #4b5563; }
          .position-badge { display: inline-block; background: #f97316; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; }
          .resume-link { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Job Application</h1>
          </div>
          <div class="content">
            <div class="field">
              <span class="position-badge">${positionTitle}</span>
              <p style="margin-top: 5px; color: #6b7280;">${positionDepartment}</p>
            </div>
            
            <div class="field">
              <div class="label">Applicant Name</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            
            ${phone ? `
            <div class="field">
              <div class="label">Phone</div>
              <div class="value">${phone}</div>
            </div>
            ` : ""}
            
            ${linkedin ? `
            <div class="field">
              <div class="label">LinkedIn</div>
              <div class="value"><a href="${linkedin.startsWith("http") ? linkedin : "https://" + linkedin}">${linkedin}</a></div>
            </div>
            ` : ""}
            
            <div class="field">
              <div class="label">Why NanoFlows?</div>
              <div class="value">${message.replace(/\n/g, "<br>")}</div>
            </div>
            
            ${resumeUrl ? `
            <div class="field">
              <div class="label">Resume</div>
              <a href="${resumeUrl}" class="resume-link">View Resume</a>
            </div>
            ` : ""}
          </div>
        </div>
      </body>
      </html>
    `;

    const attachments: { filename: string; content: Buffer }[] = [];
    
    if (resumeFile && resumeFile.size > 0) {
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      attachments.push({
        filename: resumeFile.name,
        content: buffer,
      });
    } else if (resumeUrl) {
      try {
        const response = await fetch(resumeUrl);
        if (response.ok) {
          const buffer = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get("content-type") || "";
          let extension = ".pdf";
          if (contentType.includes("doc")) extension = ".docx";
          const filename = `resume_${name.replace(/\s+/g, "_")}${extension}`;
          attachments.push({
            filename,
            content: buffer,
          });
        }
      } catch (fetchError) {
        console.warn("Could not fetch resume from URL, including link only:", fetchError);
      }
    }

    await transporter.sendMail({
      from: `"NanoFlows Careers" <${smtpUser}>`,
      to: recipientEmail,
      subject: `New Application: ${positionTitle} - ${name}`,
      html: emailHtml,
      attachments,
    });

    return NextResponse.json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("Apply API error:", error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again or contact us directly.", success: false },
      { status: 500 }
    );
  }
}
