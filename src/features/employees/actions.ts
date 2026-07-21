"use server";

import { requireAuth, requireShop } from "@/lib/supabase/auth";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { employeeInvitationHtml } from "@/lib/email/templates";
import { parseFormData } from "@/lib/schemas/parse";
import {
  inviteEmployeeSchema,
  toggleEmployeeStatusSchema,
} from "@/lib/schemas/employees";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// L'isolation tenant est garantie par RLS (shop_id = get_user_shop_id()).

export async function inviteEmployeeAction(
  formData: FormData,
): Promise<ActionResult<{ token: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(inviteEmployeeSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { email, firstName, lastName } = parsed.data;

  const { data, error } = await auth.supabase
    .from("invitations")
    .insert({
      shop_id: auth.shopId,
      email,
      first_name: firstName,
      last_name: lastName,
      invited_by: auth.user.id,
    })
    .select("token")
    .single();

  if (error) return { success: false, error: error.message };

  // Email d'invitation — effet NON critique, fire-and-forget : un échec
  // d'envoi ne fait pas échouer l'invitation (le token reste partageable).
  const { data: shop } = await auth.supabase
    .from("shops")
    .select("name")
    .eq("id", auth.shopId)
    .single<{ name: string }>();

  const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/sign-up?invitation=${data.token}`;
  void sendEmail({
    to: email,
    subject: `Invitation à rejoindre ${shop?.name ?? "l'équipe"} sur Rentic`,
    html: employeeInvitationHtml({
      shopName: shop?.name ?? "l'équipe",
      inviteUrl,
    }),
    type: "employee_invitation",
    shopId: auth.shopId,
  }).catch(() => {
    // silencieux — déjà tracé dans email_logs / console par sendEmail
  });

  revalidatePath("/team");
  return { success: true, data: { token: data.token } };
}

export async function toggleEmployeeStatusAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const auth = await requireAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseFormData(toggleEmployeeStatusSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { profileId } = parsed.data;

  // Prevent self-deactivation
  if (profileId === auth.user.id) {
    return { success: false, error: "Vous ne pouvez pas vous désactiver vous-même." };
  }

  // Toggle: check current role, if employee → set to 'owner' is wrong
  // For now, we don't have an is_active column — placeholder for future migration
  revalidatePath("/team");
  return { success: true, data: null };
}
