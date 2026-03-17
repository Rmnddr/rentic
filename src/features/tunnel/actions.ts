"use server";

import { createClient } from "@/lib/supabase/server";
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
  if (!data.acceptCgv) {
    return { success: false, error: "Vous devez accepter les conditions générales." };
  }

  if (!data.customerName || !data.customerEmail || !data.startDate || !data.endDate) {
    return { success: false, error: "Informations incomplètes." };
  }

  if (data.items.length === 0) {
    return { success: false, error: "Panier vide." };
  }

  const supabase = await createClient();

  // Verify availability
  for (const item of data.items) {
    const { data: available } = await supabase.rpc("check_availability", {
      p_product_id: item.productId,
      p_start_date: data.startDate,
      p_end_date: data.endDate,
    });

    if ((available ?? 0) < item.quantity) {
      return { success: false, error: "Un ou plusieurs produits ne sont plus disponibles." };
    }
  }

  const totalPrice = data.items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );

  // Create reservation
  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .insert({
      shop_id: data.shopId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      start_date: data.startDate,
      end_date: data.endDate,
      source: "web",
      total_price: totalPrice,
    })
    .select("id")
    .single();

  if (resError) return { success: false, error: resError.message };

  // Create items and assign units
  for (const item of data.items) {
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

    // Auto-assign units
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

    // Save participant attribute values
    const itemParticipantValues = data.participantValues.filter(
      (pv) => pv.attributeId,
    );
    for (const pv of itemParticipantValues) {
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
