/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    devBypass: boolean;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_API_URL?: string;
  readonly PUBLIC_ADHESION_URL?: string;
  readonly PUBLIC_VITRINE_URL?: string;
  readonly PUBLIC_HERO_VIDEO_URL?: string;

  // Stripe (clés serveur — ne PAS exposer côté client)
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  readonly STRIPE_CONNECTED_ACCOUNT_ID?: string;

  // NotchPay (Mobile Money)
  readonly NOTCHPAY_PUBLIC_KEY?: string;
  readonly NOTCHPAY_CONNECTED_ACCOUNT_ID?: string;
  readonly NOTCHPAY_WEBHOOK_SECRET?: string;

  // Bypass maintenance (espace développeur — obligatoire en production)
  readonly DEV_BYPASS_PASSWORD?: string;
  readonly DEV_BYPASS_SECRET?: string;
  // Token signé pour accès aux plans d'échéances
  readonly INSTALLMENT_PLAN_SECRET?: string;

  // Supabase (partage la même base que adhesion-jcbo)
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;

  // SMTP (notifications admin)
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly FROM_EMAIL?: string;
  readonly ADMIN_EMAIL?: string;
  readonly CONTACT_EMAIL?: string;
  readonly NOTIFY_EMAIL?: string;
  readonly REPLY_TO_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
