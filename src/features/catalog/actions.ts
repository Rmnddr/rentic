"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

// ── Categories ──────────────────────────────────────────

export async function createCategoryAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "product";

  if (!name) return { success: false, error: "Nom requis." };

  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  const { data, error } = await supabase
    .from("categories")
    .insert({ shop_id: shopId, name, type })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: { id: data.id } };
}

export async function updateCategoryAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;

  if (!id || !name) return { success: false, error: "Données manquantes." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name, type })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: null };
}

export async function deleteCategoryAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID manquant." };

  const supabase = await createClient();

  // Check for associated products
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: "Supprimez ou déplacez les produits de cette catégorie avant de la supprimer.",
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: null };
}

// ── Category Attributes ──────────────────────────────────

export async function createAttributeAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const categoryId = formData.get("categoryId") as string;
  const name = formData.get("name") as string;
  const scope = (formData.get("scope") as string) || "product";
  const format = (formData.get("format") as string) || "text";
  const optionsRaw = formData.get("options") as string;
  const required = formData.get("required") === "true";

  if (!categoryId || !name) return { success: false, error: "Données manquantes." };

  const options = format === "select" && optionsRaw
    ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
    : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("category_attributes")
    .insert({ category_id: categoryId, name, scope, format, options, required })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: { id: data.id } };
}

export async function deleteAttributeAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID manquant." };

  const supabase = await createClient();

  // Check for associated values
  const { count } = await supabase
    .from("product_attribute_values")
    .select("id", { count: "exact", head: true })
    .eq("attribute_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: "Cet attribut a des valeurs associées. Supprimez-les d'abord.",
    };
  }

  const { error } = await supabase.from("category_attributes").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: null };
}

// ── Products ──────────────────────────────────────────────

export async function createProductAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const priceWeb = parseInt(formData.get("priceWeb") as string) || 0;
  const priceShop = parseInt(formData.get("priceShop") as string) || 0;
  const brandId = (formData.get("brandId") as string) || null;

  if (!name || !categoryId) return { success: false, error: "Nom et catégorie requis." };

  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  const { data, error } = await supabase
    .from("products")
    .insert({
      shop_id: shopId,
      category_id: categoryId,
      brand_id: brandId || null,
      name,
      description,
      price_web: priceWeb,
      price_shop: priceShop,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: { id: data.id } };
}

export async function updateProductAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const priceWeb = parseInt(formData.get("priceWeb") as string) || 0;
  const priceShop = parseInt(formData.get("priceShop") as string) || 0;
  const brandId = (formData.get("brandId") as string) || null;

  if (!id || !name) return { success: false, error: "Données manquantes." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ name, description, price_web: priceWeb, price_shop: priceShop, brand_id: brandId || null })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: null };
}

export async function deleteProductAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID manquant." };

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: null };
}

// ── Product Units ─────────────────────────────────────────

export async function createUnitAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const productId = formData.get("productId") as string;
  const label = formData.get("label") as string;

  if (!productId || !label) return { success: false, error: "Données manquantes." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_units")
    .insert({ product_id: productId, label })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: { id: data.id } };
}

export async function updateUnitAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  const label = formData.get("label") as string;
  const status = formData.get("status") as string;

  if (!id) return { success: false, error: "ID manquant." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_units")
    .update({ label, status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: null };
}

export async function deleteUnitAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID manquant." };

  const supabase = await createClient();
  const { error } = await supabase.from("product_units").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: null };
}

// ── Brands ────────────────────────────────────────────────

export async function createBrandAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const name = formData.get("name") as string;
  if (!name) return { success: false, error: "Nom requis." };

  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  const { data, error } = await supabase
    .from("brands")
    .insert({ shop_id: shopId, name })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: { id: data.id } };
}

export async function deleteBrandAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "ID manquant." };

  const supabase = await createClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: "Cette marque est utilisée par des produits. Retirez-la des produits d'abord.",
    };
  }

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/(dashboard)/catalog");
  return { success: true, data: null };
}
