import type { APIRoute } from "astro";
import {
  createDevBypassToken,
  DEV_BYPASS_COOKIE,
  getDevBypassPassword,
  hasDevBypass,
  isDevBypassConfigured,
} from "../../lib/dev-bypass";
import { checkRateLimit } from "../../lib/rateLimit";

const JSON_HEADERS = { "Content-Type": "application/json" };

function cookieOptions(maxAge: number): string {
  const secure = import.meta.env.PROD ? "; Secure" : "";
  return `${DEV_BYPASS_COOKIE}=${createDevBypassToken()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export const GET: APIRoute = async ({ request }) => {
  return new Response(JSON.stringify({ active: hasDevBypass(request.headers.get("cookie")) }), {
    status: 200,
    headers: JSON_HEADERS,
  });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!isDevBypassConfigured()) {
    return new Response(JSON.stringify({ error: "Non disponible" }), {
      status: 503,
      headers: JSON_HEADERS,
    });
  }

  const ip = clientAddress || "unknown";
  const { allowed } = checkRateLimit(`dev-bypass:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Trop de tentatives. Réessayez plus tard." }), {
      status: 429,
      headers: JSON_HEADERS,
    });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps invalide" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const password = String(body.password ?? "").trim();
  const expected = getDevBypassPassword();
  if (!expected || password !== expected) {
    return new Response(JSON.stringify({ error: "Mot de passe incorrect" }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      ...JSON_HEADERS,
      "Set-Cookie": cookieOptions(60 * 60 * 24 * 7),
    },
  });
};

export const DELETE: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      ...JSON_HEADERS,
      "Set-Cookie": `${DEV_BYPASS_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
};
