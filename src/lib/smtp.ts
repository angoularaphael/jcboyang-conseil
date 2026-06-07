import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

function cleanEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

export function createSmtpTransport() {
  const port = Number(cleanEnv(import.meta.env.SMTP_PORT) || "587");
  const host = cleanEnv(import.meta.env.SMTP_HOST) || "pro2.mail.ovh.net";
  const user = cleanEnv(import.meta.env.SMTP_USER);
  const pass = cleanEnv(import.meta.env.SMTP_PASS);
  const secure = cleanEnv(import.meta.env.SMTP_SECURE) === "true" || port === 465;

  const options: SMTPTransport.Options = {
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  };

  return nodemailer.createTransport(options);
}

export function isSmtpConfigured(): boolean {
  return !!(
    cleanEnv(import.meta.env.SMTP_USER) &&
    cleanEnv(import.meta.env.SMTP_PASS)
  );
}
