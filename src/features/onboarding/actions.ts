"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/global";
import { redirect } from "next/navigation";

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;

  if (!firstName || !lastName) {
    return { success: false, error: "Nom et prénom requis." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      onboarding_current_step: 2,
    })
    .eq("id", user.id);

  // Update shop phone if provided
  if (phone) {
    await supabase
      .from("shops")
      .update({ phone })
      .eq("id", (await supabase.from("profiles").select("shop_id").eq("id", user.id).single()).data?.shop_id ?? "");
  }

  if (error) return { success: false, error: error.message };
  return { success: true, data: null };
}

export async function updateShopAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const name = formData.get("shopName") as string;
  const address = formData.get("address") as string;
  const siret = formData.get("siret") as string;
  const tvaNumber = formData.get("tvaNumber") as string;

  if (!name) {
    return { success: false, error: "Nom du magasin requis." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("shop_id")
    .eq("id", user.id)
    .single();

  if (!profile?.shop_id) return { success: false, error: "Shop introuvable." };

  const { error } = await supabase
    .from("shops")
    .update({ name, address, siret, tva_number: tvaNumber })
    .eq("id", profile.shop_id);

  if (error) return { success: false, error: error.message };

  await supabase
    .from("profiles")
    .update({ onboarding_current_step: 3 })
    .eq("id", user.id);

  return { success: true, data: null };
}

export async function createFirstCategoryAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const name = formData.get("categoryName") as string;
  const type = (formData.get("categoryType") as string) || "product";

  if (!name) {
    return { success: false, error: "Nom de la catégorie requis." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("shop_id")
    .eq("id", user.id)
    .single();

  if (!profile?.shop_id) return { success: false, error: "Shop introuvable." };

  const { error: catError } = await supabase
    .from("categories")
    .insert({ shop_id: profile.shop_id, name, type });

  if (catError) return { success: false, error: catError.message };

  // Mark onboarding as completed
  await supabase
    .from("shops")
    .update({ onboarding_completed: true })
    .eq("id", profile.shop_id);

  redirect("/dashboard");
}
