export function getContactEmail(): string {
  return (import.meta.env.CONTACT_EMAIL ?? "contact@jcbo-conseil.com").trim();
}

export function getNotifyEmail(): string {
  return (import.meta.env.NOTIFY_EMAIL ?? getContactEmail()).trim();
}

export function getFromEmail(): string {
  return (import.meta.env.FROM_EMAIL ?? "JCBO Conseil <no-reply@jcbo-conseil.com>").trim();
}

export function getReplyToEmail(): string {
  return (import.meta.env.REPLY_TO_EMAIL ?? getContactEmail()).trim();
}
