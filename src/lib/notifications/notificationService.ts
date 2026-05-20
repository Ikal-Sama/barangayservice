// Notification service – email (via nodemailer) and placeholder for SMS

import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class NotificationService {
  private transporter: nodemailer.Transporter | null;

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (!host || !port || !user || !pass) {
      console.warn("SMTP configuration missing – email notifications disabled.");
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass },
      });
    }
  }

  async sendEmail(opts: EmailOptions): Promise<void> {
    if (!this.transporter) {
      console.warn("Attempted to send email without SMTP config.");
      return;
    }
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || "\"BarangayLink\" <no-reply@barangaylink.local>",
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
  }

  // TODO: add SMS support (e.g., Twilio) when credentials are provided.
}

export const notificationService = new NotificationService();
