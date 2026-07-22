import { z } from "zod";
import { shopMediaUrlSchema } from "./shop-media";

// Schémas partagés du domaine catalogue (source de vérité NCF, alignés sur
// les CHECK constraints de 20260317000003_create_catalog_schema.sql).

export const uuidSchema = z.uuid("Identifiant invalide.");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Nom requis.")
  .max(200, "Nom trop long (max 200 caractères).");

const priceSchema = z.coerce
  .number("Prix invalide.")
  .int("Le prix doit être un nombre entier de centimes.")
  .min(0, "Le prix ne peut pas être négatif.")
  .max(1_000_000_00, "Prix trop élevé.");

// ── Categories ────────────────────────────────────────────

export const categoryTypeSchema = z.enum(["product", "participant"]);

export const createCategorySchema = z.object({
  name: nameSchema,
  type: categoryTypeSchema.default("product").catch("product"),
});

export const updateCategorySchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  type: categoryTypeSchema,
});

export const deleteByIdSchema = z.object({ id: uuidSchema });

// ── Category attributes (EAV) ─────────────────────────────

export const attributeScopeSchema = z.enum(["product", "participant"]);
export const attributeFormatSchema = z.enum(["text", "number", "select"]);

export const createAttributeSchema = z.object({
  categoryId: uuidSchema,
  name: nameSchema,
  scope: attributeScopeSchema.default("product").catch("product"),
  format: attributeFormatSchema.default("text").catch("text"),
  options: z
    .string()
    .max(2000, "Liste d'options trop longue.")
    .optional()
    .default(""),
  required: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === "true" || v === true),
});

// ── Products ──────────────────────────────────────────────

export const createProductSchema = z.object({
  name: nameSchema,
  categoryId: uuidSchema,
  description: z
    .string()
    .trim()
    .max(2000, "Description trop longue (max 2000 caractères).")
    .optional()
    .default(""),
  priceWeb: priceSchema.default(0),
  priceShop: priceSchema.default(0),
  brandId: uuidSchema.optional().or(z.literal("")).nullable(),
  imageUrl: shopMediaUrlSchema.optional().default(""),
});

export const updateProductSchema = createProductSchema
  .omit({ categoryId: true })
  .extend({ id: uuidSchema });

// ── Product units ─────────────────────────────────────────

export const unitStatusSchema = z.enum(["available", "maintenance", "retired"]);

export const createUnitSchema = z.object({
  productId: uuidSchema,
  label: nameSchema,
});

export const updateUnitSchema = z.object({
  id: uuidSchema,
  label: nameSchema,
  status: unitStatusSchema,
});

// ── Brands ────────────────────────────────────────────────

export const createBrandSchema = z.object({ name: nameSchema });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
