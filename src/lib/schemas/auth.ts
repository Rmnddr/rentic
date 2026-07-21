import { z } from "zod";

// Schémas du domaine auth (NCF). Actions publiques (signup/login) :
// pas de requireAuth, mais validation stricte des entrées.

export const emailSchema = z
  .email("Adresse email invalide.")
  .max(320, "Adresse email trop longue (max 320 caractères).");

export const passwordSchema = z
  .string("Mot de passe requis.")
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(128, "Le mot de passe est trop long (max 128 caractères).");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
