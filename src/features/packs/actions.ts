"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

type PackItemInput = {
  productId: string;
  isRequired: boolean;
  priceWebOverride: number | null;
  priceShopOverride: number | null;
  position: number;
};

export async function createPackAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const itemsJson = formData.get("items") as string;

  if (!name) return { success: false, error: "Nom du pack requis." };

  let items: PackItemInput[];
  try {
    items = JSON.parse(itemsJson || "[]");
  } catch {
    return { success: false, error: "Format des items invalide." };
  }

  if (items.length < 2) {
    return { success: false, error: "Un pack doit contenir au moins 2 produits." };
  }

  if (!items.some((i) => i.isRequired)) {
    return { success: false, error: "Un pack doit contenir au moins un produit obligatoire." };
  }

  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  const { data: pack, error: packError } = await supabase
    .from("packs")
    .insert({ shop_id: shopId, name, description })
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

  const { error: itemsError } = await supabase
    .from("pack_items")
    .insert(packItems);

  if (itemsError) return { success: false, error: itemsError.message };

  revalidatePath("/(dashboard)/packs");
  return { success: true, data: { id: pack.id } };
}

export async function updatePackAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const itemsJson = formData.get("items") as string;

  if (!id || !name) return { success: false, error: "Données manquantes." };

  let items: PackItemInput[];
  try {
    items = JSON.parse(itemsJson || "[]");
  } catch {
    return { success: false, error: "Format des items invalide." };
  }

  if (items.length < 2) {
    return { success: false, error: "Un pack doit contenir au moins 2 produits." };
  }

  if (!items.some((i) => i.isRequired)) {
    return { success: false, error: "Un pack doit contenir au moins un produit obligatoire." };
  }

  const supabase = await createClient();

  const { error: packError } = await supabase
    .from("packs")
    .update({ name, description })
    .eq("id", id);

  if (packError) return { success: false, error: packError.message };

  // Replace all pack items
  await supabase.from("pack_items").delete().eq("pack_id", id);

  const packItems = items.map((item) => ({
    pack_id: id,
    product_id: item.productId,
    is_required: item.isRequired,
    price_web_override: item.priceWebOverride,
    price_shop_override: item.priceShopOverride,
    position: item.position,
  }));

  const { error: itemsError } = await supabase
    .from("pack_items")
    .insert(packItems);

  if (itemsError) return { success: false, error: itemsError.message };

  revalidatePath("/(dashboard)/packs");
  return { success: true, data: null };
}

export async function deletePackAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID manquant." };

  const supabase = await createClient();
  const { error } = await supabase.from("packs").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/(dashboard)/packs");
  return { success: true, data: null };
}
