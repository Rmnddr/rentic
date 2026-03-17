"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types/global";
import { redirect } from "next/navigation";

export async function signUpAction(
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email et mot de passe requis." };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Le mot de passe doit contenir au moins 8 caractères.",
      fieldErrors: {
        password: ["Le mot de passe doit contenir au moins 8 caractères."],
      },
    };
  }

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
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: "Email ou mot de passe incorrect." };
  }

  redirect("/(dashboard)");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/(auth)/login");
}
