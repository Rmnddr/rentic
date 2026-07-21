import { z } from "zod";
import { uuidSchema } from "./catalog";

// Schémas du domaine réservations (source de vérité NCF, alignés sur les
// CHECK constraints de 20260317000006_create_reservations_schema.sql).

const customerNameSchema = z
  .string()
  .trim()
  .min(1, "Nom du client requis.")
  .max(200, "Nom trop long (max 200 caractères).");

const optionalEmailSchema = z
  .union([z.email("Email invalide.").max(320, "Email trop long (max 320 caractères)."), z.literal("")])
  .optional()
  .default("");

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "Numéro de téléphone trop long.")
  .optional()
  .default("");

export const isoDateSchema = z.iso.date("Date invalide (format AAAA-MM-JJ attendu).");

export const quantitySchema = z
  .number("Quantité invalide.")
  .int("La quantité doit être un nombre entier.")
  .positive("La quantité doit être supérieure à zéro.")
  .max(100, "Quantité trop élevée (max 100).");

export const unitPriceSchema = z
  .number("Prix invalide.")
  .int("Le prix doit être un nombre entier de centimes.")
  .min(0, "Le prix ne peut pas être négatif.")
  .max(1_000_000_00, "Prix trop élevé.");

export const reservationItemSchema = z.object({
  productId: uuidSchema,
  packId: uuidSchema.nullable().optional().default(null),
  quantity: quantitySchema,
  unitPrice: unitPriceSchema,
  isOptional: z.boolean().optional().default(false),
});

/**
 * Le champ `items` arrive dans le FormData sous forme de chaîne JSON :
 * on parse d'abord la chaîne, puis on pipe le résultat vers le schéma
 * de tableau pour valider chaque item.
 */
const itemsJsonSchema = z
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
      .array(reservationItemSchema)
      .min(1, "Au moins un produit requis.")
      .max(50, "Trop de produits dans la réservation (max 50)."),
  );

// Valeurs autorisées par la contrainte CHECK de `reservations.source`.
export const reservationSourceSchema = z.enum(["back-office", "web"]);

// Valeurs autorisées par la contrainte CHECK de `reservations.status`.
export const reservationStatusSchema = z.enum([
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const createReservationSchema = z
  .object({
    customerName: customerNameSchema,
    customerEmail: optionalEmailSchema,
    customerPhone: optionalPhoneSchema,
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    items: itemsJsonSchema,
    source: reservationSourceSchema.default("back-office").catch("back-office"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "La date de fin doit être postérieure ou égale à la date de début.",
    path: ["endDate"],
  });

export const updateReservationStatusSchema = z.object({
  id: uuidSchema,
  status: reservationStatusSchema,
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type ReservationItemInput = z.infer<typeof reservationItemSchema>;
