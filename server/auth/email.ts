import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@dishswap.com";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    // If SMTP credentials are not configured, log to console instead
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn("[Email] SMTP not configured. Emails will be logged to console.");
      return null;
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email: string, token: string, name?: string) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e07a5f; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #e07a5f; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to DishSwap!</h1>
        </div>
        <div class="content">
          <p>Hi ${name || 'there'},</p>
          <p>Thank you for registering with DishSwap! Please verify your email address to activate your account.</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account with DishSwap, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} DishSwap. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, "Verify your DishSwap account", html);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #e07a5f; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #e07a5f; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; border-left: 4px solid: #ffc107; padding: 10px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${name || 'there'},</p>
          <p>We received a request to reset your password for your DishSwap account.</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <div class="warning">
            <strong>Security Notice:</strong> This link will expire in 15 minutes for your security.
          </div>
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} DishSwap. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, "Reset your DishSwap password", html);
}

/**
 * Generic email sending function
 */
async function sendEmail(to: string, subject: string, html: string) {
  const transport = getTransporter();
  
  // If no transporter (SMTP not configured), log to console
  if (!transport) {
    console.log("\n========== EMAIL (Development Mode) ==========");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
    console.log("==============================================\n");
    return true;
  }

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
}
