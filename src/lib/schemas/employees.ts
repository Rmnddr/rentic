import { z } from "zod";
import { uuidSchema } from "./catalog";

// Schémas du domaine équipe (source de vérité NCF, alignés sur les colonnes
// de 20260317000010_create_invitations.sql : invitations, profiles).

const optionalNameSchema = z
  .string()
  .trim()
  .max(100, "Nom trop long (max 100 caractères).")
  .optional()
  .default("");

export const inviteEmployeeSchema = z.object({
  email: z
    .email("Email invalide.")
    .max(320, "Email trop long (max 320 caractères)."),
  firstName: optionalNameSchema,
  lastName: optionalNameSchema,
});

export const toggleEmployeeStatusSchema = z.object({
  profileId: uuidSchema,
});

export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;
export type ToggleEmployeeStatusInput = z.infer<typeof toggleEmployeeStatusSchema>;
