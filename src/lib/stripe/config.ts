import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

// Lazy : STRIPE_SECRET_KEY est optionnelle tant que l'Epic 6 n'est pas
// configuré — on ne crash qu'à l'usage réel, pas à l'import du module.
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  stripeClient ??= new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    typescript: true,
  });
  return stripeClient;
}
