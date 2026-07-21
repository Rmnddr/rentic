"use server";

import { requireAuth, requireShop } from "@/lib/supabase/auth";
import { parseFormData } from "@/lib/schemas/parse";
import {
  createAttributeSchema,
  createBrandSchema,
  createCategorySchema,
  createProductSchema,
  createUnitSchema,
  deleteByIdSchema,
  updateCategorySchema,
  updateProductSchema,
  updateUnitSchema,
} from "@/lib/schemas/catalog";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// L'isolation tenant est garantie par RLS (shop_id = get_user_shop_id()).

// ── Categories ──────────────────────────────────────────

export async function createCategoryAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(createCategorySchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { name, type } = parsed.data;

  const { data, error } = await auth.supabase
    .from("categories")
    .insert({ shop_id: auth.shopId, name, type })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: { id: data.id } };
}

export async function updateCategoryAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updateCategorySchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { id, name, type } = parsed.data;

  const { error } = await auth.supabase
    .from("categories")
    .update({ name, type })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: null };
}

export async function deleteCategoryAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(deleteByIdSchema, formData);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { id } = parsed.data;

  const { count } = await auth.supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: "Supprimez ou déplacez les produits de cette catégorie avant de la supprimer.",
    };
  }

  const { error } = await auth.supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: null };
}

// ── Category Attributes ──────────────────────────────────

export async function createAttributeAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(createAttributeSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { categoryId, name, scope, format, options: optionsRaw, required } = parsed.data;

  const options =
    format === "select" && optionsRaw
      ? optionsRaw.split(",").map((o) => o.trim()).filter(Boolean)
      : null;

  const { data, error } = await auth.supabase
    .from("category_attributes")
    .insert({ category_id: categoryId, name, scope, format, options, required })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: { id: data.id } };
}

export async function deleteAttributeAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(deleteByIdSchema, formData);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { id } = parsed.data;

  const { count } = await auth.supabase
    .from("product_attribute_values")
    .select("id", { count: "exact", head: true })
    .eq("attribute_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: "Cet attribut a des valeurs associées. Supprimez-les d'abord.",
    };
  }

  const { error } = await auth.supabase
    .from("category_attributes")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: null };
}

// ── Products ──────────────────────────────────────────────

export async function createProductAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(createProductSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { name, categoryId, description, priceWeb, priceShop, brandId } = parsed.data;

  const { data, error } = await auth.supabase
    .from("products")
    .insert({
      shop_id: auth.shopId,
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
  revalidatePath("/catalog");
  return { success: true, data: { id: data.id } };
}

export async function updateProductAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updateProductSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { id, name, description, priceWeb, priceShop, brandId } = parsed.data;

  const { error } = await auth.supabase
    .from("products")
    .update({
      name,
      description,
      price_web: priceWeb,
      price_shop: priceShop,
      brand_id: brandId || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: null };
}

export async function deleteProductAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(deleteByIdSchema, formData);
  if (!parsed.ok) return { success: false, error: parsed.error };

  const { error } = await auth.supabase
    .from("products")
    .delete()
    .eq("id", parsed.data.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: null };
}

// ── Product Units ─────────────────────────────────────────

export async function createUnitAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(createUnitSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { productId, label } = parsed.data;

  const { data, error } = await auth.supabase
    .from("product_units")
    .insert({ product_id: productId, label })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: { id: data.id } };
}

export async function updateUnitAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updateUnitSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { id, label, status } = parsed.data;

  const { error } = await auth.supabase
    .from("product_units")
    .update({ label, status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: null };
}

export async function deleteUnitAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(deleteByIdSchema, formData);
  if (!parsed.ok) return { success: false, error: parsed.error };

  const { error } = await auth.supabase
    .from("product_units")
    .delete()
    .eq("id", parsed.data.id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: null };
}

// ── Brands ────────────────────────────────────────────────

export async function createBrandAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(createBrandSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const { data, error } = await auth.supabase
    .from("brands")
    .insert({ shop_id: auth.shopId, name: parsed.data.name })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: { id: data.id } };
}

export async function deleteBrandAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(deleteByIdSchema, formData);
  if (!parsed.ok) return { success: false, error: parsed.error };
  const { id } = parsed.data;

  const { count } = await auth.supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id);

  if (count && count > 0) {
    return {
      success: false,
      error: "Cette marque est utilisée par des produits. Retirez-la des produits d'abord.",
    };
  }

  const { error } = await auth.supabase.from("brands").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/catalog");
  return { success: true, data: null };
}
