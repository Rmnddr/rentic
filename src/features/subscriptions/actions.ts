"use server";

import { requireShop } from "@/lib/supabase/auth";
import { parseInput } from "@/lib/schemas/parse";
import { checkoutPlanSchema } from "@/lib/schemas/subscriptions";
import { getStripe } from "@/lib/stripe/config";
import { env, requireEnv } from "@/lib/env";
import type { ActionResult } from "@/types/global";
import { redirect } from "next/navigation";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// getStripe() est appelé APRÈS l'auth : pas d'instanciation du client Stripe
// pour un appelant non authentifié.

export async function createCheckoutSessionAction(
  plan: "season" | "annual",
): Promise<ActionResult<{ url: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseInput(checkoutPlanSchema, plan);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const stripe = getStripe();
  const priceId = requireEnv(
    parsed.data === "season" ? "STRIPE_PRICE_SEASON" : "STRIPE_PRICE_ANNUAL",
  );

  // Récupère ou crée le customer Stripe du magasin.
  const { data: subscription } = await auth.supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("shop_id", auth.shopId)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: auth.user.email,
      metadata: { shop_id: auth.shopId },
    });
    customerId = customer.id;

    const { error } = await auth.supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("shop_id", auth.shopId);

    if (error) return { success: false, error: error.message };
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
    metadata: { shop_id: auth.shopId, plan: parsed.data },
  });

  if (!session.url) {
    return { success: false, error: "Impossible de créer la session de paiement." };
  }

  redirect(session.url);
}

export async function createCustomerPortalAction(): Promise<ActionResult<{ url: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const { data: subscription } = await auth.supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("shop_id", auth.shopId)
    .single();

  if (!subscription?.stripe_customer_id) {
    return { success: false, error: "Aucun abonnement Stripe trouvé." };
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/subscription`,
  });

  redirect(session.url);
}
