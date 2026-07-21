import { z } from "zod";
import { categoryTypeSchema } from "./catalog";

// Schémas du domaine onboarding (source de vérité NCF, alignés sur les
// colonnes de 20260317000001_create_foundation_schema.sql : profiles, shops).

const personNameSchema = z
  .string()
  .trim()
  .min(1, "Nom et prénom requis.")
  .max(100, "Nom trop long (max 100 caractères).");

// ── Profil (étape 1) ──────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  phone: z
    .string()
    .trim()
    .max(30, "Numéro de téléphone trop long (max 30 caractères).")
    .optional()
    .default(""),
});

// ── Magasin (étape 2) ─────────────────────────────────────

export const shopSlugSchema = z
  .string()
  .trim()
  .min(2, "Slug trop court (min 2 caractères).")
  .max(60, "Slug trop long (max 60 caractères).")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug invalide : minuscules, chiffres et tirets uniquement.",
  );

export const updateShopSchema = z.object({
  shopName: z
    .string()
    .trim()
    .min(1, "Nom du magasin requis.")
    .max(200, "Nom trop long (max 200 caractères)."),
  address: z
    .string()
    .trim()
    .max(500, "Adresse trop longue (max 500 caractères).")
    .optional()
    .default(""),
  siret: z
    .string()
    .trim()
    .max(20, "SIRET trop long (max 20 caractères).")
    .optional()
    .default(""),
  tvaNumber: z
    .string()
    .trim()
    .max(30, "Numéro de TVA trop long (max 30 caractères).")
    .optional()
    .default(""),
  slug: shopSlugSchema.optional().or(z.literal("")),
});

// ── Première catégorie (étape 3) ──────────────────────────

export const createFirstCategorySchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(1, "Nom de la catégorie requis.")
    .max(200, "Nom trop long (max 200 caractères)."),
  categoryType: categoryTypeSchema.default("product").catch("product"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type CreateFirstCategoryInput = z.infer<typeof createFirstCategorySchema>;
