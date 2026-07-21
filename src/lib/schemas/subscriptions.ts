import { z } from "zod";

// Schémas du domaine abonnements (source de vérité NCF, alignés sur les
// CHECK constraints de 20260317000009_create_subscriptions_schema.sql).

export const subscriptionPlanSchema = z.enum(["trial", "season", "annual"]);

export const subscriptionStatusSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "expired",
]);

// Seules les formules payantes sont achetables via Checkout.
export const checkoutPlanSchema = z.enum(
  ["season", "annual"],
  "Formule d'abonnement invalide.",
);

export type CheckoutPlan = z.infer<typeof checkoutPlanSchema>;
