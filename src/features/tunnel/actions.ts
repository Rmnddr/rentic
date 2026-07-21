"use server";

import { createClient } from "@/lib/supabase/server";
import { parseInput } from "@/lib/schemas/parse";
import { createWebReservationSchema } from "@/lib/schemas/tunnel";
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
      p_customer_phone: input.customerPhone || null,
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

  return { success: true, data: { reservationId } };
}
