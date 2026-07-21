import { z } from "zod";
import { uuidSchema } from "./catalog";
import { isoDateSchema } from "./reservations";

// Schémas du tunnel de réservation web (client final NON authentifié).
// L'action étant publique, la validation Zod est la première barrière ;
// la fonction Postgres create_web_reservation revalide et recalcule les
// prix côté serveur (le client n'envoie JAMAIS de prix).

const tunnelItemSchema = z.object({
  productId: uuidSchema,
  packId: uuidSchema.nullable().optional().default(null),
  quantity: z
    .number("Quantité invalide.")
    .int("Quantité invalide.")
    .min(1, "Quantité minimale : 1.")
    .max(100, "Quantité maximale : 100."),
  isOptional: z.boolean().optional().default(false),
});

const tunnelParticipantValueSchema = z.object({
  itemIndex: z
    .number("Index d'item invalide.")
    .int("Index d'item invalide.")
    .min(0, "Index d'item invalide.")
    .max(49, "Index d'item invalide."),
  attributeId: uuidSchema,
  value: z.string().max(2000, "Valeur trop longue (max 2000 caractères)."),
  participantIndex: z
    .number("Index de participant invalide.")
    .int("Index de participant invalide.")
    .min(0, "Index de participant invalide.")
    .max(100, "Index de participant invalide."),
});

export const createWebReservationSchema = z
  .object({
    shopId: uuidSchema,
    customerName: z
      .string()
      .trim()
      .min(1, "Nom requis.")
      .max(200, "Nom trop long (max 200 caractères)."),
    customerEmail: z
      .email("Email invalide.")
      .max(320, "Email trop long (max 320 caractères)."),
    customerPhone: z
      .string()
      .trim()
      .max(30, "Numéro de téléphone trop long.")
      .optional()
      .default(""),
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    items: z
      .array(tunnelItemSchema)
      .min(1, "Panier vide.")
      .max(50, "Trop de produits dans le panier (max 50)."),
    participantValues: z
      .array(tunnelParticipantValueSchema)
      .max(500, "Trop de valeurs de participants.")
      .optional()
      .default([]),
    acceptCgv: z.literal(true, "Vous devez accepter les conditions générales."),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "La date de fin doit être postérieure ou égale à la date de début.",
    path: ["endDate"],
  });

export type CreateWebReservationInput = z.infer<typeof createWebReservationSchema>;
export type TunnelItemInput = z.input<typeof tunnelItemSchema>;
