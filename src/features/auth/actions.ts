"use server";

import { createClient } from "@/lib/supabase/server";
import { parseFormData } from "@/lib/schemas/parse";
import { signInSchema, signUpSchema } from "@/lib/schemas/auth";
import type { ActionResult } from "@/types/global";
import { redirect } from "next/navigation";

// Actions PUBLIQUES (signup/login/logout) : pas de requireAuth — l'ordre NCF
// se réduit ici à VALIDATION → OPÉRATION.

export async function signUpAction(
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const parsed = parseFormData(signUpSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { email, password } = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Cet email est déjà utilisé." };
    }
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      message: "Compte créé ! Vérifiez votre email pour confirmer.",
    },
  };
}

export async function signInAction(
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = parseFormData(signInSchema, formData);
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }
  const { email, password } = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: "Email ou mot de passe incorrect." };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
