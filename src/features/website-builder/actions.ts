"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

export async function updateWebsiteAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const heroTitle = formData.get("heroTitle") as string;
  const heroSubtitle = formData.get("heroSubtitle") as string;
  const heroImageUrl = formData.get("heroImageUrl") as string;
  const sectionsJson = formData.get("sections") as string;
  const isPublished = formData.get("isPublished") === "true";

  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  let sections;
  try {
    sections = sectionsJson ? JSON.parse(sectionsJson) : [];
  } catch {
    return { success: false, error: "Format des sections invalide." };
  }

  // Upsert website config
  const { error } = await supabase
    .from("shop_websites")
    .upsert(
      {
        shop_id: shopId,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_image_url: heroImageUrl,
        sections,
        is_published: isPublished,
      },
      { onConflict: "shop_id" },
    );

  if (error) return { success: false, error: error.message };

  // Revalidate public pages
  const { data: shop } = await supabase
    .from("shops")
    .select("slug")
    .eq("id", shopId)
    .single();

  if (shop?.slug) {
    revalidatePath(`/s/${shop.slug}`);
  }

  revalidatePath("/(dashboard)/website");
  return { success: true, data: null };
}

export async function updateCgvAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const cgvContent = formData.get("cgvContent") as string;

  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  const { error } = await supabase
    .from("shop_websites")
    .upsert(
      { shop_id: shopId, cgv_content: cgvContent },
      { onConflict: "shop_id" },
    );

  if (error) return { success: false, error: error.message };

  revalidatePath("/(dashboard)/website");
  return { success: true, data: null };
}
