"use server";

import { requireShop } from "@/lib/supabase/auth";
import { parseFormData } from "@/lib/schemas/parse";
import {
  createFirstCategorySchema,
  updateProfileSchema,
  updateShopSchema,
} from "@/lib/schemas/onboarding";
import type { ActionResult } from "@/types/global";
import { redirect } from "next/navigation";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// Le shop est créé à l'inscription : requireShop() est donc sûr dès l'étape 1.

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updateProfileSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { firstName, lastName, phone } = parsed.data;

  const { error } = await auth.supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      onboarding_current_step: 2,
    })
    .eq("id", auth.user.id);

  if (error) return { success: false, error: error.message };

  // Update shop phone if provided
  if (phone) {
    const { error: phoneError } = await auth.supabase
      .from("shops")
      .update({ phone })
      .eq("id", auth.shopId);
    if (phoneError) return { success: false, error: phoneError.message };
  }

  return { success: true, data: null };
}

export async function updateShopAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updateShopSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { shopName, address, siret, tvaNumber, slug } = parsed.data;

  const update: Record<string, string> = {
    name: shopName,
    address,
    siret,
    tva_number: tvaNumber,
  };
  if (slug) update.slug = slug;

  const { error } = await auth.supabase
    .from("shops")
    .update(update)
    .eq("id", auth.shopId);

  if (error) return { success: false, error: error.message };

  await auth.supabase
    .from("profiles")
    .update({ onboarding_current_step: 3 })
    .eq("id", auth.user.id);

  return { success: true, data: null };
}

export async function createFirstCategoryAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(createFirstCategorySchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { categoryName, categoryType } = parsed.data;

  const { error: catError } = await auth.supabase
    .from("categories")
    .insert({ shop_id: auth.shopId, name: categoryName, type: categoryType });

  if (catError) return { success: false, error: catError.message };

  // Mark onboarding as completed
  await auth.supabase
    .from("shops")
    .update({ onboarding_completed: true })
    .eq("id", auth.shopId);

  redirect("/dashboard");
}
