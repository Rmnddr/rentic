"use server";

import { requireAuth, requireShop } from "@/lib/supabase/auth";
import { parseFormData } from "@/lib/schemas/parse";
import {
  createReservationSchema,
  updateReservationStatusSchema,
} from "@/lib/schemas/reservations";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// L'isolation tenant est garantie par RLS (shop_id = get_user_shop_id()).

export async function createReservationAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(createReservationSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { customerName, customerEmail, customerPhone, startDate, endDate, items, source } =
    parsed.data;

  // VÉRIFICATION : disponibilité de chaque produit sur la période.
  for (const item of items) {
    const { data: available } = await auth.supabase.rpc("check_availability", {
      p_product_id: item.productId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if ((available ?? 0) < item.quantity) {
      return {
        success: false,
        error: `Stock insuffisant pour un des produits (${available ?? 0} disponible(s), ${item.quantity} demandé(s)).`,
      };
    }
  }

  const totalPrice = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const { data: reservation, error: resError } = await auth.supabase
    .from("reservations")
    .insert({
      shop_id: auth.shopId,
      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      start_date: startDate,
      end_date: endDate,
      source,
      total_price: totalPrice,
    })
    .select("id")
    .single();

  if (resError) return { success: false, error: resError.message };

  for (const item of items) {
    const { data: resItem, error: itemError } = await auth.supabase
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
    const { data: availableUnits } = await auth.supabase
      .from("product_units")
      .select("id")
      .eq("product_id", item.productId)
      .eq("status", "available")
      .limit(item.quantity);

    if (availableUnits) {
      for (const unit of availableUnits) {
        await auth.supabase.from("reservation_unit_assignments").insert({
          reservation_item_id: resItem.id,
          product_unit_id: unit.id,
        });
      }
    }
  }

  revalidatePath("/reservations");
  return { success: true, data: { id: reservation.id } };
}

export async function updateReservationStatusAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updateReservationStatusSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { id, status: newStatus } = parsed.data;

  // VÉRIFICATION : la réservation existe et la transition est autorisée.
  const { data: reservation } = await auth.supabase
    .from("reservations")
    .select("status")
    .eq("id", id)
    .single();

  if (!reservation) return { success: false, error: "Réservation introuvable." };

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

  const { error } = await auth.supabase
    .from("reservations")
    .update(updates)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/reservations");
  return { success: true, data: null };
}
