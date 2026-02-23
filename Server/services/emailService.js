import nodemailer from "nodemailer";

let cachedTransporter = null;

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration missing. Set SMTP_HOST, SMTP_USER, and SMTP_PASS."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const getTransporter = () => {
  if (!cachedTransporter) {
    cachedTransporter = createTransporter();
  }
  return cachedTransporter;
};

const getFromAddress = () => {
  const fromName = process.env.MAIL_FROM_NAME || "Mentor Language Institute";
  const fromAddress = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;
  if (!fromAddress) {
    throw new Error(
      "MAIL_FROM_ADDRESS (or SMTP_USER) is required for sending emails."
    );
  }
  return `"${fromName}" <${fromAddress}>`;
};

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  if (!to) {
    throw new Error("Recipient email is required.");
  }
  const transporter = getTransporter();
  const from = getFromAddress();

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
    attachments,
  });
};
