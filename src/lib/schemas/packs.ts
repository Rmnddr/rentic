import { z } from "zod";
import { uuidSchema } from "./catalog";

// Schémas du domaine packs (source de vérité NCF, alignés sur
// 20260317000005_create_packs_schema.sql : overrides de prix nullables,
// position entière >= 0, is_required booléen).

const packNameSchema = z
  .string()
  .trim()
  .min(1, "Nom du pack requis.")
  .max(200, "Nom trop long (max 200 caractères).");

const priceOverrideSchema = z
  .number("Prix invalide.")
  .int("Le prix doit être un nombre entier de centimes.")
  .min(0, "Le prix ne peut pas être négatif.")
  .max(1_000_000_00, "Prix trop élevé.")
  .nullable()
  .optional()
  .default(null);

export const packItemSchema = z.object({
  productId: uuidSchema,
  isRequired: z.boolean().optional().default(false),
  priceWebOverride: priceOverrideSchema,
  priceShopOverride: priceOverrideSchema,
  position: z
    .number("Position invalide.")
    .int("Position invalide.")
    .min(0, "Position invalide.")
    .max(1000, "Position invalide.")
    .optional()
    .default(0),
});

/**
 * Le champ `items` arrive dans le FormData sous forme de chaîne JSON :
 * parse de la chaîne puis pipe vers le schéma de tableau (règles métier :
 * au moins 2 produits dont au moins 1 obligatoire).
 */
const packItemsJsonSchema = z
  .string("Format des items invalide.")
  .transform((value, ctx) => {
    try {
      return JSON.parse(value === "" ? "[]" : value) as unknown;
    } catch {
      ctx.addIssue({ code: "custom", message: "Format des items invalide." });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(packItemSchema)
      .min(2, "Un pack doit contenir au moins 2 produits.")
      .max(50, "Trop de produits dans le pack (max 50).")
      .refine((items) => items.some((i) => i.isRequired), {
        message: "Un pack doit contenir au moins un produit obligatoire.",
      }),
  );

export const createPackSchema = z.object({
  name: packNameSchema,
  description: z
    .string()
    .trim()
    .max(2000, "Description trop longue (max 2000 caractères).")
    .optional()
    .default(""),
  items: packItemsJsonSchema,
});

export const updatePackSchema = createPackSchema.extend({ id: uuidSchema });

export type CreatePackInput = z.infer<typeof createPackSchema>;
export type PackItemInput = z.infer<typeof packItemSchema>;
