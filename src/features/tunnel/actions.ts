"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseInput } from "@/lib/schemas/parse";
import { createWebReservationSchema } from "@/lib/schemas/tunnel";
import { createTunnelPaymentSchema } from "@/lib/schemas/payments";
import { getStripe } from "@/lib/stripe/config";
import { sendEmail } from "@/lib/email/send";
import { bookingConfirmationHtml } from "@/lib/email/templates";
import type { ActionResult } from "@/types/global";

type TunnelItem = {
  productId: string;
  packId?: string | null;
  quantity: number;
  isOptional?: boolean;
};

type ParticipantValue = {
  itemIndex: number;
  attributeId: string;
  value: string;
  participantIndex: number;
};

// Ordre NCF : VALIDATION → OPÉRATION (la VÉRIFICATION — dispo, prix,
// appartenance au shop — vit DANS la fonction Postgres, atomiquement).
//
// ACTION PUBLIQUE PAR DESIGN : le tunnel de réservation est utilisé par le
// client final du magasin, qui n'est PAS authentifié. Pas de requireAuth ici.
// Toute l'écriture passe par create_web_reservation (SECURITY DEFINER) :
// transaction unique, prix recalculés serveur, unités verrouillées (FOR
// UPDATE) et trigger anti double-booking en filet final.

const RPC_ERROR_MESSAGES: Record<string, string> = {
  SHOP_NOT_PUBLIC: "Cette boutique n'accepte pas les réservations en ligne.",
  INVALID_CUSTOMER: "Informations de contact invalides.",
  INVALID_DATES: "Les dates sélectionnées sont invalides.",
  INVALID_ITEMS: "Panier invalide.",
  INVALID_QUANTITY: "Quantité invalide.",
  INVALID_PARTICIPANTS: "Informations participants invalides.",
  PRODUCT_NOT_IN_SHOP: "Un produit du panier n'existe pas dans cette boutique.",
  ITEM_NOT_IN_PACK: "Un produit du panier ne fait pas partie du pack indiqué.",
  INSUFFICIENT_STOCK:
    "Un ou plusieurs produits ne sont plus disponibles sur cette période. Veuillez ajuster votre panier.",
};

function mapRpcError(message: string): string {
  for (const [code, friendly] of Object.entries(RPC_ERROR_MESSAGES)) {
    if (message.includes(code)) return friendly;
  }
  if (message.includes("Double booking")) {
    return RPC_ERROR_MESSAGES.INSUFFICIENT_STOCK;
  }
  return "La réservation n'a pas pu être créée. Veuillez réessayer.";
}

export async function createWebReservationAction(data: {
  shopId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  items: TunnelItem[];
  participantValues: ParticipantValue[];
  acceptCgv: boolean;
}): Promise<ActionResult<{ reservationId: string }>> {
  const parsed = parseInput(createWebReservationSchema, data);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const input = parsed.data;

  const supabase = await createClient();

  const { data: reservationId, error } = await supabase.rpc(
    "create_web_reservation",
    {
      p_shop_id: input.shopId,
      p_customer_name: input.customerName,
      p_customer_email: input.customerEmail,
      // La fonction SQL normalise elle-même la chaîne vide en NULL
      // (nullif(trim(coalesce(...)))) : on lui passe donc "" plutôt que null,
      // conforme à sa signature `p_customer_phone text`.
      p_customer_phone: input.customerPhone,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
      p_items: input.items.map((item) => ({
        product_id: item.productId,
        pack_id: item.packId ?? null,
        quantity: item.quantity,
        is_optional: item.isOptional ?? false,
      })),
      p_participant_values: input.participantValues.map((pv) => ({
        item_index: pv.itemIndex,
        attribute_id: pv.attributeId,
        value: pv.value,
        participant_index: pv.participantIndex,
      })),
    },
  );

  if (error) {
    return { success: false, error: mapRpcError(error.message) };
  }

  if (typeof reservationId !== "string" || reservationId.length === 0) {
    return {
      success: false,
      error: "La réservation n'a pas pu être créée. Veuillez réessayer.",
    };
  }

  // Email de confirmation — effet NON critique, fire-and-forget : on ne
  // bloque pas la réponse et un échec d'email ne fait JAMAIS échouer la
  // réservation (sendEmail ne jette jamais, ceinture + bretelles ici).
  void sendReservationConfirmationEmail(reservationId).catch(() => {
    // silencieux — déjà tracé dans email_logs / console par sendEmail
  });

  return { success: true, data: { reservationId } };
}

// ── Email de confirmation de réservation web ─────────────
//
// Relit la réservation via le client admin (l'appelant est anonyme, RLS
// bloque la lecture) pour reconstruire le récap : items, prix serveur, shop.

type ReservationEmailRow = {
  id: string;
  shop_id: string;
  customer_name: string;
  customer_email: string | null;
  start_date: string;
  end_date: string;
  total_price: number;
};

type ReservationItemEmailRow = {
  quantity: number;
  unit_price: number;
  products: { name: string } | null;
};

async function sendReservationConfirmationEmail(
  reservationId: string,
): Promise<void> {
  const admin = createAdminClient();

  const { data: reservation, error: reservationError } = await admin
    .from("reservations")
    .select(
      "id, shop_id, customer_name, customer_email, start_date, end_date, total_price",
    )
    .eq("id", reservationId)
    .single<ReservationEmailRow>();

  if (reservationError || !reservation || !reservation.customer_email) return;

  const [{ data: shop }, { data: items }] = await Promise.all([
    admin
      .from("shops")
      .select("name")
      .eq("id", reservation.shop_id)
      .single<{ name: string }>(),
    admin
      .from("reservation_items")
      .select("quantity, unit_price, products(name)")
      .eq("reservation_id", reservationId)
      .returns<ReservationItemEmailRow[]>(),
  ]);

  const shopName = shop?.name ?? "votre magasin";
  const reference = reservation.id.slice(0, 8).toUpperCase();

  await sendEmail({
    to: reservation.customer_email,
    subject: `Réservation confirmée — ${shopName} (réf. ${reference})`,
    html: bookingConfirmationHtml({
      shopName,
      customerName: reservation.customer_name,
      startDate: reservation.start_date,
      endDate: reservation.end_date,
      items: (items ?? []).map((item) => ({
        name: item.products?.name ?? "Article",
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
      totalPrice: reservation.total_price,
      reference,
    }),
    type: "booking_confirmation",
    shopId: reservation.shop_id,
  });
}

// ── Paiement CB du tunnel (Stripe Connect) ───────────────
//
// ACTION PUBLIQUE : le client final paie sans être authentifié. Le montant
// est TOUJOURS relu en base (jamais accepté du client), via le client admin
// car l'anonyme ne peut pas lire reservations (RLS). Connaître un id de
// réservation ne permet que de la payer — pas de fuite de données.

const PAYMENT_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 h pour payer après création

export async function createTunnelPaymentAction(data: {
  reservationId: string;
}): Promise<ActionResult<{ clientSecret: string }>> {
  const parsed = parseInput(createTunnelPaymentSchema, data);
  if (!parsed.ok) {
    return { success: false, error: parsed.error };
  }

  const admin = createAdminClient();

  // VÉRIFICATION : réservation web récente, non payée, boutique encaissable.
  const { data: reservation } = await admin
    .from("reservations")
    .select("id, shop_id, total_price, status, source, created_at")
    .eq("id", parsed.data.reservationId)
    .single();

  if (
    !reservation ||
    reservation.source !== "web" ||
    reservation.status !== "confirmed" ||
    reservation.total_price <= 0
  ) {
    return { success: false, error: "Réservation introuvable ou non payable." };
  }

  if (Date.now() - new Date(reservation.created_at).getTime() > PAYMENT_WINDOW_MS) {
    return {
      success: false,
      error: "Le délai de paiement est dépassé. Contactez la boutique.",
    };
  }

  const { data: alreadyPaid } = await admin
    .from("payments")
    .select("id")
    .eq("reservation_id", reservation.id)
    .eq("status", "succeeded")
    .limit(1);

  if (alreadyPaid && alreadyPaid.length > 0) {
    return { success: false, error: "Cette réservation est déjà payée." };
  }

  const stripe = getStripe();

  // IDEMPOTENCE : réutilise le PaymentIntent en attente s'il en existe un —
  // un remontage du composant ou un rechargement de page ne doit pas créer
  // un second intent (ni une seconde ligne payments) pour la même réservation.
  const { data: pending } = await admin
    .from("payments")
    .select("stripe_payment_intent_id")
    .eq("reservation_id", reservation.id)
    .eq("status", "pending")
    .eq("method", "card")
    .not("stripe_payment_intent_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const pendingIntentId = pending?.[0]?.stripe_payment_intent_id;
  if (pendingIntentId) {
    try {
      const existing = await stripe.paymentIntents.retrieve(pendingIntentId);
      const reusable =
        existing.status === "requires_payment_method" ||
        existing.status === "requires_confirmation" ||
        existing.status === "requires_action";

      if (reusable && existing.amount === reservation.total_price && existing.client_secret) {
        return { success: true, data: { clientSecret: existing.client_secret } };
      }
    } catch {
      // Intent introuvable côté Stripe → on en crée un nouveau ci-dessous
    }
  }

  const { data: stripeAccount } = await admin
    .from("shop_stripe_accounts")
    .select("stripe_account_id, charges_enabled")
    .eq("shop_id", reservation.shop_id)
    .single();

  if (!stripeAccount?.charges_enabled) {
    return {
      success: false,
      error: "Cette boutique n'accepte pas le paiement en ligne.",
    };
  }

  // OPÉRATION : destination charge — la plateforme encaisse puis transfère
  // au compte Connect du loueur.
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: reservation.total_price,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      transfer_data: { destination: stripeAccount.stripe_account_id },
      metadata: {
        reservation_id: reservation.id,
        shop_id: reservation.shop_id,
      },
    },
    // Deuxième garde-fou contre les doublons : deux appels concurrents pour
    // la même réservation retournent le même intent côté Stripe.
    { idempotencyKey: `tunnel-payment-${reservation.id}` },
  );

  if (!paymentIntent.client_secret) {
    return { success: false, error: "Impossible d'initialiser le paiement." };
  }

  const { error } = await admin.from("payments").insert({
    reservation_id: reservation.id,
    stripe_payment_intent_id: paymentIntent.id,
    amount: reservation.total_price,
    status: "pending",
    method: "card",
  });

  if (error) {
    return { success: false, error: "Impossible d'initialiser le paiement." };
  }

  return { success: true, data: { clientSecret: paymentIntent.client_secret } };
}
