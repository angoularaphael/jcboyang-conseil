import type { APIRoute } from "astro";
import {
  createDevBypassToken,
  DEV_BYPASS_COOKIE,
  getDevBypassPassword,
  hasDevBypass,
} from "../../lib/dev-bypass";

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

export const POST: APIRoute = async ({ request }) => {
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
  if (password !== getDevBypassPassword()) {
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
