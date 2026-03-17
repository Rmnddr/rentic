"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/config";
import type { ActionResult } from "@/types/global";
import { redirect } from "next/navigation";

const PLANS = {
  season: { priceId: process.env.STRIPE_PRICE_SEASON!, name: "Saison", amount: 45000 },
  annual: { priceId: process.env.STRIPE_PRICE_ANNUAL!, name: "Annuel", amount: 79000 },
} as const;

export async function createCheckoutSessionAction(
  plan: "season" | "annual",
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("shop_id", shopId)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { shop_id: shopId },
    });
    customerId = customer.id;

    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("shop_id", shopId);
  }

  const planConfig = PLANS[plan];

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/(dashboard)/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/(dashboard)/subscription?canceled=true`,
    metadata: { shop_id: shopId, plan },
  });

  redirect(session.url!);
}

export async function createCustomerPortalAction(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("shop_id", shopId)
    .single();

  if (!subscription?.stripe_customer_id) {
    return { success: false, error: "Aucun abonnement Stripe trouvé." };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/(dashboard)/subscription`,
  });

  redirect(session.url);
}
