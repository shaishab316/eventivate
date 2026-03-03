import nodemailer from "nodemailer";
import config from "@/config";

// ─── Transport ────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.port === 465,
  auth: {
    user: config.mail.user,
    pass: config.mail.pass,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using the configured transporter.
 */
export async function sendMail({ to, subject, html }: MailOptions) {
  return await transporter.sendMail({
    from: `"${process.env.npm_package_name}" <${config.mail.user}>`,
    to,
    subject,
    html,
  });
}
