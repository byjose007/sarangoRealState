import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

/**
 * No-ops (with a console warning) when SMTP isn't configured, so lead
 * creation/stage changes never fail just because notifications aren't set
 * up yet — see .env.example for SMTP_* vars.
 */
export async function sendMail({ to, subject, text }: SendMailInput) {
  const client = getTransporter();
  if (!client) {
    console.warn(`[mail] SMTP not configured — skipping email "${subject}" to ${to}`);
    return;
  }

  try {
    await client.sendMail({ from: process.env.SMTP_FROM || 'Vestra <notifications@vestra.estate>', to, subject, text });
  } catch (error) {
    // Notification failures should never break the CRM action that triggered them.
    console.error('[mail] Failed to send email', error);
  }
}
