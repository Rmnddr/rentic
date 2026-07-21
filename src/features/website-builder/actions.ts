"use server";

import { requireShop } from "@/lib/supabase/auth";
import { parseFormData } from "@/lib/schemas/parse";
import { updateCgvSchema, updateWebsiteSchema } from "@/lib/schemas/website";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// L'isolation tenant est garantie par RLS (shop_id = get_user_shop_id()).

export async function updateWebsiteAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updateWebsiteSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { heroTitle, heroSubtitle, heroImageUrl, sections: sectionsJson, isPublished } =
    parsed.data;

  let sections: unknown;
  try {
    sections = sectionsJson ? JSON.parse(sectionsJson) : [];
  } catch {
    return {
      success: false,
      error: "Format des sections invalide.",
      fieldErrors: { sections: ["Format des sections invalide."] },
    };
  }
  if (!Array.isArray(sections)) {
    return {
      success: false,
      error: "Format des sections invalide.",
      fieldErrors: { sections: ["Format des sections invalide."] },
    };
  }

  // Upsert website config
  const { error } = await auth.supabase
    .from("shop_websites")
    .upsert(
      {
        shop_id: auth.shopId,
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
  const { data: shop } = await auth.supabase
    .from("shops")
    .select("slug")
    .eq("id", auth.shopId)
    .single();

  if (shop?.slug) {
    revalidatePath(`/s/${shop.slug}`);
  }

  revalidatePath("/website");
  return { success: true, data: null };
}

export async function updateCgvAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(updateCgvSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const { error } = await auth.supabase
    .from("shop_websites")
    .upsert(
      { shop_id: auth.shopId, cgv_content: parsed.data.cgvContent },
      { onConflict: "shop_id" },
    );

  if (error) return { success: false, error: error.message };

  revalidatePath("/website");
  return { success: true, data: null };
}
