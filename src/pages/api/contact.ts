import type { APIRoute } from "astro";
import { z } from "zod";
import { sendLeadEmails } from "../../lib/email";
import { checkRateLimit } from "../../lib/rateLimit";
import { isHoneypotFilled, looksLikeBotSubmission } from "../../lib/spam";

const KNOWN_FIELDS = new Set([
  "name",
  "email",
  "phone",
  "company",
  "need",
  "message",
  "consent",
  "source",
  "website",
  "url",
  "company_url",
]);

const bodySchema = z.object({
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().max(200).trim().toLowerCase(),
  phone: z.string().min(4).max(40).trim(),
  company: z.string().max(200).trim().optional().default(""),
  need: z.string().max(120).trim().optional().default(""),
  message: z.string().max(3000).trim().optional().default(""),
  source: z.enum(["audit", "contact"]).optional().default("audit"),
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(`contact:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    const minutes = Math.max(1, Math.ceil(retryAfterMs / 60000));
    return new Response(JSON.stringify({ error: `Trop de demandes. Réessayez dans ${minutes} minute(s).` }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (KNOWN_FIELDS.has(key) || typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) fields[key] = trimmed;
  }

  // Bots : on répond OK sans envoyer d'e-mail (évite qu'ils adaptent leurs attaques).
  if (isHoneypotFilled(raw) || looksLikeBotSubmission(parsed.data.name, fields)) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await sendLeadEmails({ ...parsed.data, fields });
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error ?? "Envoi impossible" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
