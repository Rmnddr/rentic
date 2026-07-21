import { z } from "zod";
import { uuidSchema } from "./catalog";

// Schémas du domaine facturation (NCF).

export const generateInvoiceSchema = z.object({
  reservationId: uuidSchema,
});

export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
