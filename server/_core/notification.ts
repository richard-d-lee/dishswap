// Email notification service using Nodemailer
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

let transporter: Transporter | null = null;

function getEmailTransporter(): Transporter {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error(
        "SMTP credentials missing: set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS"
      );
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }
  return transporter;
}

/**
 * Send an email notification to the app owner
 * @param payload - Notification title and content
 * @returns true if sent successfully, false otherwise
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = payload;

  if (!title || title.trim().length === 0) {
    console.warn("[Notification] Title is required");
    return false;
  }

  if (!content || content.trim().length === 0) {
    console.warn("[Notification] Content is required");
    return false;
  }

  if (title.length > TITLE_MAX_LENGTH) {
    console.warn(`[Notification] Title exceeds ${TITLE_MAX_LENGTH} characters`);
    return false;
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    console.warn(`[Notification] Content exceeds ${CONTENT_MAX_LENGTH} characters`);
    return false;
  }

  try {
    const mailer = getEmailTransporter();
    const ownerEmail = process.env.OWNER_EMAIL || process.env.SMTP_USER;

    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ownerEmail,
      subject: title,
      text: content,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${title}</h2>
        <div style="color: #666; line-height: 1.6;">${content.replace(/\n/g, "<br>")}</div>
      </div>`,
    });

    return true;
  } catch (error) {
    console.warn("[Notification] Error sending email:", error);
    return false;
  }
}
