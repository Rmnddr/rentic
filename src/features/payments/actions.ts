"use server";

import { requireAuth, requireShop } from "@/lib/supabase/auth";
import { parseFormData } from "@/lib/schemas/parse";
import { recordCashPaymentSchema } from "@/lib/schemas/payments";
import { getStripe } from "@/lib/stripe/config";
import { env } from "@/lib/env";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// getStripe() est appelé APRÈS l'auth : pas d'instanciation du client Stripe
// pour un appelant non authentifié.

// ── Stripe Connect Onboarding ────────────────────────────

export async function createStripeConnectAction(): Promise<ActionResult<{ url: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const stripe = getStripe();

  // Vérifie si un compte Connect existe déjà pour ce magasin.
  const { data: existing } = await auth.supabase
    .from("shop_stripe_accounts")
    .select("stripe_account_id")
    .eq("shop_id", auth.shopId)
    .single();

  let accountId: string;

  if (existing?.stripe_account_id) {
    accountId = existing.stripe_account_id;
  } else {
    // Crée un compte Express.
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { shop_id: auth.shopId },
    });

    accountId = account.id;

    const { error } = await auth.supabase.from("shop_stripe_accounts").insert({
      shop_id: auth.shopId,
      stripe_account_id: accountId,
    });

    if (error) return { success: false, error: error.message };
  }

  // Crée le lien d'onboarding.
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${env.NEXT_PUBLIC_APP_URL}/settings?stripe=refresh`,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/settings?stripe=success`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}

// NB : le PaymentIntent du tunnel public vit dans features/tunnel/actions.ts
// (createTunnelPaymentAction) — action publique, montant relu en base.

// ── Record Cash Payment ──────────────────────────────────

export async function recordCashPaymentAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(recordCashPaymentSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { reservationId, amount } = parsed.data;

  const { error } = await auth.supabase.from("payments").insert({
    reservation_id: reservationId,
    amount,
    status: "succeeded",
    method: "cash",
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/reservations");
  return { success: true, data: null };
}
