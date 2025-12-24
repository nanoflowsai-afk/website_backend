import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY || 're_9nFJZinG_L8Kx1ApbDfcLssqB77DKLALk';
const resend = new Resend(apiKey);

export const sendWebinarRegistrationEmail = async (email: string, userName: string, webinarTitle: string, date: string, time: string) => {
    console.log("Sending email via Resend to:", email, "Key:", apiKey.slice(0, 5) + "...");
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>', // Updating to use the default testing domain or a configured verified domain
            to: [email],
            subject: `Registration Confirmed: ${webinarTitle}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>You're registered!</h1>
          <p>Hi ${userName},</p>
          <p>You have successfully registered for <strong>${webinarTitle}</strong>.</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p>We look forward to seeing you there!</p>
          <br>
          <p>Best regards,</p>
          <p>The Webinar Team</p>
        </div>
      `,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return null;
        }

        console.log("Resend Success Data:", data);
        return data;
    } catch (error) {
        console.error("Error sending email", error);
        return null;
    }
};
