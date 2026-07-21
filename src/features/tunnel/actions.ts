"use server";

import { createClient } from "@/lib/supabase/server";
import { parseInput } from "@/lib/schemas/parse";
import { createWebReservationSchema } from "@/lib/schemas/tunnel";
import type { ActionResult } from "@/types/global";

type TunnelItem = {
  productId: string;
  packId?: string | null;
  quantity: number;
  unitPrice: number;
  isOptional: boolean;
};

type ParticipantValue = {
  attributeId: string;
  value: string;
  participantIndex: number;
};

// Ordre NCF : VALIDATION → VÉRIFICATION → OPÉRATION.
//
// ACTION PUBLIQUE PAR DESIGN : le tunnel de réservation est utilisé par le
// client final du magasin, qui n'est PAS authentifié. Pas de requireAuth ici —
// la validation Zod stricte (shopId UUID, bornes sur chaque champ) et les
// politiques RLS côté base constituent les seules barrières.

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

  // VÉRIFICATION : disponibilité de chaque produit sur la période.
  for (const item of input.items) {
    const { data: available } = await supabase.rpc("check_availability", {
      p_product_id: item.productId,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
    });

    if ((available ?? 0) < item.quantity) {
      return {
        success: false,
        error: "Un ou plusieurs produits ne sont plus disponibles.",
      };
    }
  }

  const totalPrice = input.items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );

  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .insert({
      shop_id: input.shopId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone || null,
      start_date: input.startDate,
      end_date: input.endDate,
      source: "web",
      total_price: totalPrice,
    })
    .select("id")
    .single();

  if (resError) return { success: false, error: resError.message };

  for (const item of input.items) {
    const { data: resItem, error: itemError } = await supabase
      .from("reservation_items")
      .insert({
        reservation_id: reservation.id,
        product_id: item.productId,
        pack_id: item.packId || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        is_optional: item.isOptional,
      })
      .select("id")
      .single();

    if (itemError) return { success: false, error: itemError.message };

    // Assignation automatique des unités disponibles.
    const { data: units } = await supabase
      .from("product_units")
      .select("id")
      .eq("product_id", item.productId)
      .eq("status", "available")
      .limit(item.quantity);

    if (units) {
      for (const unit of units) {
        await supabase.from("reservation_unit_assignments").insert({
          reservation_item_id: resItem.id,
          product_unit_id: unit.id,
        });
      }
    }

    // Valeurs d'attributs des participants (déjà validées par Zod).
    for (const pv of input.participantValues) {
      await supabase.from("participant_attribute_values").insert({
        reservation_item_id: resItem.id,
        category_attribute_id: pv.attributeId,
        value: pv.value,
        participant_index: pv.participantIndex,
      });
    }
  }

  return { success: true, data: { reservationId: reservation.id } };
}
