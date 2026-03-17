"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

export async function inviteEmployeeAction(
  formData: FormData,
): Promise<ActionResult<{ token: string }>> {
  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  if (!email) return { success: false, error: "Email requis." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const shopId = (await supabase.rpc("get_user_shop_id")).data;
  if (!shopId) return { success: false, error: "Shop introuvable." };

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      shop_id: shopId,
      email,
      first_name: firstName,
      last_name: lastName,
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (error) return { success: false, error: error.message };

  // TODO: Send invitation email via Resend (Epic 6.5)

  revalidatePath("/(dashboard)/team");
  return { success: true, data: { token: data.token } };
}

export async function toggleEmployeeStatusAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const profileId = formData.get("profileId") as string;

  if (!profileId) return { success: false, error: "ID manquant." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Prevent self-deactivation
  if (profileId === user?.id) {
    return { success: false, error: "Vous ne pouvez pas vous désactiver vous-même." };
  }

  // Toggle: check current role, if employee → set to 'owner' is wrong
  // For now, we don't have an is_active column — placeholder for future migration
  revalidatePath("/(dashboard)/team");
  return { success: true, data: null };
}
