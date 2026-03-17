"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/config";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ── Stripe Connect Onboarding ────────────────────────────

export async function createStripeConnectAction(): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  // Check if account already exists
  const { data: existing } = await supabase
    .from("shop_stripe_accounts")
    .select("stripe_account_id")
    .eq("shop_id", shopId)
    .single();

  let accountId: string;

  if (existing?.stripe_account_id) {
    accountId = existing.stripe_account_id;
  } else {
    // Create Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { shop_id: shopId },
    });

    accountId = account.id;

    await supabase.from("shop_stripe_accounts").insert({
      shop_id: shopId,
      stripe_account_id: accountId,
    });
  }

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?stripe=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?stripe=success`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}

// ── Create Payment Intent (for web tunnel) ───────────────

export async function createPaymentIntentAction(
  reservationId: string,
  amount: number,
): Promise<ActionResult<{ clientSecret: string }>> {
  const supabase = await createClient();

  // Get shop's Stripe account
  const { data: reservation } = await supabase
    .from("reservations")
    .select("shop_id")
    .eq("id", reservationId)
    .single();

  if (!reservation) return { success: false, error: "Réservation introuvable." };

  const { data: stripeAccount } = await supabase
    .from("shop_stripe_accounts")
    .select("stripe_account_id, charges_enabled")
    .eq("shop_id", reservation.shop_id)
    .single();

  if (!stripeAccount?.charges_enabled) {
    return { success: false, error: "Le loueur n'a pas encore activé les paiements." };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "eur",
    transfer_data: {
      destination: stripeAccount.stripe_account_id,
    },
    metadata: {
      reservation_id: reservationId,
      shop_id: reservation.shop_id,
    },
  });

  // Record pending payment
  await supabase.from("payments").insert({
    reservation_id: reservationId,
    stripe_payment_intent_id: paymentIntent.id,
    amount,
    status: "pending",
    method: "card",
  });

  return {
    success: true,
    data: { clientSecret: paymentIntent.client_secret! },
  };
}

// ── Record Cash Payment ──────────────────────────────────

export async function recordCashPaymentAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const reservationId = formData.get("reservationId") as string;
  const amount = parseInt(formData.get("amount") as string) || 0;

  if (!reservationId || amount <= 0) {
    return { success: false, error: "Réservation et montant requis." };
  }

  const supabase = await createClient();

  await supabase.from("payments").insert({
    reservation_id: reservationId,
    amount,
    status: "succeeded",
    method: "cash",
  });

  revalidatePath("/reservations");
  return { success: true, data: null };
}
