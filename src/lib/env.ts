import { z } from "zod";

/**
 * Validation des variables d'environnement — crash au démarrage si une
 * variable critique manque (pattern NCF). Les intégrations pas encore
 * configurées (Stripe, Resend) sont optionnelles : leurs modules doivent
 * appeler `requireEnv("STRIPE_SECRET_KEY")` au moment de l'usage.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  REVALIDATION_SECRET: z.string().min(8),

  // Optionnelles — non configurées à ce stade
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS: z.string().optional(),
  STRIPE_WEBHOOK_SECRET_CONNECT: z.string().optional(),
  STRIPE_PRICE_SEASON: z.string().optional(),
  STRIPE_PRICE_ANNUAL: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n  ");
    throw new Error(`Variables d'environnement invalides :\n  ${missing}`);
  }
  return parsed.data;
}

export const env = loadEnv();

/** Récupère une variable optionnelle en exigeant sa présence à l'usage. */
export function requireEnv(key: keyof Env): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Variable d'environnement requise mais absente : ${key}`);
  }
  return value;
}
