"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

type ReservationItemInput = {
  productId: string;
  packId?: string | null;
  quantity: number;
  unitPrice: number;
  isOptional: boolean;
};

export async function createReservationAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const customerName = formData.get("customerName") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const itemsJson = formData.get("items") as string;
  const source = (formData.get("source") as string) || "back-office";

  if (!customerName || !startDate || !endDate) {
    return { success: false, error: "Nom du client et dates requis." };
  }

  let items: ReservationItemInput[];
  try {
    items = JSON.parse(itemsJson || "[]");
  } catch {
    return { success: false, error: "Format des items invalide." };
  }

  if (items.length === 0) {
    return { success: false, error: "Au moins un produit requis." };
  }

  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  // Check availability for each item
  for (const item of items) {
    const { data: available } = await supabase.rpc("check_availability", {
      p_product_id: item.productId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if ((available ?? 0) < item.quantity) {
      return {
        success: false,
        error: `Stock insuffisant pour un des produits (${available} disponible(s), ${item.quantity} demandé(s)).`,
      };
    }
  }

  const totalPrice = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );

  // Create reservation
  const { data: reservation, error: resError } = await supabase
    .from("reservations")
    .insert({
      shop_id: shopId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      start_date: startDate,
      end_date: endDate,
      source,
      total_price: totalPrice,
    })
    .select("id")
    .single();

  if (resError) return { success: false, error: resError.message };

  // Create reservation items
  for (const item of items) {
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

    // Auto-assign available units
    const { data: availableUnits } = await supabase
      .from("product_units")
      .select("id")
      .eq("product_id", item.productId)
      .eq("status", "available")
      .limit(item.quantity);

    if (availableUnits) {
      for (const unit of availableUnits) {
        await supabase.from("reservation_unit_assignments").insert({
          reservation_item_id: resItem.id,
          product_unit_id: unit.id,
        });
      }
    }
  }

  revalidatePath("/(dashboard)/reservations");
  return { success: true, data: { id: reservation.id } };
}

export async function updateReservationStatusAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  const newStatus = formData.get("status") as string;

  if (!id || !newStatus) return { success: false, error: "Données manquantes." };

  const supabase = await createClient();

  // Get current reservation
  const { data: reservation } = await supabase
    .from("reservations")
    .select("status")
    .eq("id", id)
    .single();

  if (!reservation) return { success: false, error: "Réservation introuvable." };

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    confirmed: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[reservation.status]?.includes(newStatus)) {
    return {
      success: false,
      error: `Transition invalide : ${reservation.status} → ${newStatus}`,
    };
  }

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === "in_progress") updates.started_at = new Date().toISOString();
  if (newStatus === "completed") updates.completed_at = new Date().toISOString();
  if (newStatus === "cancelled") updates.cancelled_at = new Date().toISOString();

  const { error } = await supabase
    .from("reservations")
    .update(updates)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/(dashboard)/reservations");
  return { success: true, data: null };
}
