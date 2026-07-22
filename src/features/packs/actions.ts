"use server";

import { requireAuth, requireShop } from "@/lib/supabase/auth";
import { parseFormData } from "@/lib/schemas/parse";
import { deleteByIdSchema } from "@/lib/schemas/catalog";
import { createPackSchema, updatePackSchema } from "@/lib/schemas/packs";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// L'isolation tenant est garantie par RLS (shop_id = get_user_shop_id()).

export async function createPackAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(createPackSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { name, description, imageUrl, items } = parsed.data;

  const { data: pack, error: packError } = await auth.supabase
    .from("packs")
    .insert({ shop_id: auth.shopId, name, description, image_url: imageUrl || null })
    .select("id")
    .single();

  if (packError) return { success: false, error: packError.message };

  const packItems = items.map((item) => ({
    pack_id: pack.id,
    product_id: item.productId,
    is_required: item.isRequired,
    price_web_override: item.priceWebOverride,
    price_shop_override: item.priceShopOverride,
    position: item.position,
  }));

  const { error: itemsError } = await auth.supabase
    .from("pack_items")
    .insert(packItems);

  if (itemsError) return { success: false, error: itemsError.message };

  revalidatePath("/packs");
  return { success: true, data: { id: pack.id } };
}

export async function updatePackAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updatePackSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { id, name, description, imageUrl, items } = parsed.data;

  const { error: packError } = await auth.supabase
    .from("packs")
    .update({ name, description, image_url: imageUrl || null })
    .eq("id", id);

  if (packError) return { success: false, error: packError.message };

  // Remplacement complet des items du pack.
  await auth.supabase.from("pack_items").delete().eq("pack_id", id);

  const packItems = items.map((item) => ({
    pack_id: id,
    product_id: item.productId,
    is_required: item.isRequired,
    price_web_override: item.priceWebOverride,
    price_shop_override: item.priceShopOverride,
    position: item.position,
  }));

  const { error: itemsError } = await auth.supabase
    .from("pack_items")
    .insert(packItems);

  if (itemsError) return { success: false, error: itemsError.message };

  revalidatePath("/packs");
  return { success: true, data: null };
}

export async function deletePackAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(deleteByIdSchema, formData);
  if (!parsed.ok) return { success: false, error: parsed.error };

  const { error } = await auth.supabase
    .from("packs")
    .delete()
    .eq("id", parsed.data.id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/packs");
  return { success: true, data: null };
}
