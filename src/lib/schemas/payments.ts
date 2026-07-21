import { z } from "zod";
import { uuidSchema } from "./catalog";

// Schémas du domaine paiements (source de vérité NCF, alignés sur les
// CHECK constraints de 20260317000008_create_payments_schema.sql).

export const paymentStatusSchema = z.enum([
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const paymentMethodSchema = z.enum(["card", "cash"]);

// Montant en centimes : entier strictement positif.
export const amountCentsSchema = z.coerce
  .number("Montant invalide.")
  .int("Le montant doit être un nombre entier de centimes.")
  .min(1, "Le montant doit être supérieur à zéro.");

// Paiement web (tunnel public) : uniquement l'id de réservation — le
// montant est TOUJOURS relu en base, jamais accepté du client.
export const createTunnelPaymentSchema = z.object({
  reservationId: uuidSchema,
});

export const recordCashPaymentSchema = z.object({
  reservationId: uuidSchema,
  amount: amountCentsSchema,
});

export type RecordCashPaymentInput = z.infer<typeof recordCashPaymentSchema>;
