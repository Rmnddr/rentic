import { z } from "zod";
import { shopMediaUrlSchema } from "./shop-media";

// Schémas du domaine website-builder (source de vérité NCF, alignés sur les
// colonnes de 20260317000007_create_shop_websites.sql : shop_websites).

const titleSchema = z
  .string()
  .trim()
  .max(200, "Titre trop long (max 200 caractères).")
  .optional()
  .default("");

const longTextSchema = z
  .string()
  .max(500_000, "Contenu trop long (max 500 000 caractères).")
  .optional()
  .default("");

// ── Configuration du site (hero + sections) ───────────────

export const updateWebsiteSchema = z.object({
  heroTitle: titleSchema,
  heroSubtitle: titleSchema,
  // Restreint au bucket shop-media DEPUIS la soumission uniquement : une
  // valeur externe déjà en base (saisie du temps où le champ était une URL
  // libre) reste affichable côté vitrine, mais re-sauvegarder le formulaire
  // exigera une image uploadée dans le bucket (ou aucune image).
  heroImageUrl: shopMediaUrlSchema.optional().default(""),
  // JSON brut des sections — parsé/vérifié dans l'action (étape VÉRIFICATION).
  sections: longTextSchema,
  isPublished: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === "true" || v === true),
});

// ── CGV ───────────────────────────────────────────────────

export const updateCgvSchema = z.object({
  cgvContent: longTextSchema,
});

export type UpdateWebsiteInput = z.infer<typeof updateWebsiteSchema>;
export type UpdateCgvInput = z.infer<typeof updateCgvSchema>;
