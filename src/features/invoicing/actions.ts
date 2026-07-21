"use server";

import { requireShop } from "@/lib/supabase/auth";
import { parseInput } from "@/lib/schemas/parse";
import { generateInvoiceSchema } from "@/lib/schemas/invoicing";
import { ensureInvoice } from "@/features/invoicing/generate-invoice";
import type { ActionResult } from "@/types/global";
import { revalidatePath } from "next/cache";

// Ordre NCF dans chaque action : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// L'isolation tenant est garantie par RLS + vérification explicite du shop_id.

export async function generateInvoiceAction(
  reservationId: string,
): Promise<ActionResult<{ invoiceId: string; invoiceNumber: string }>> {
  const auth = await requireShop();
  if (!auth.ok) return { success: false, error: auth.error };

  const parsed = parseInput(generateInvoiceSchema, { reservationId });
  if (!parsed.ok) {
    return { success: false, error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  // VÉRIFICATION + OPÉRATION déléguées à ensureInvoice (idempotent).
  const result = await ensureInvoice(
    auth.supabase,
    auth.shopId,
    parsed.data.reservationId,
  );
  if (!result.ok) return { success: false, error: result.error };

  revalidatePath("/reservations");
  return {
    success: true,
    data: {
      invoiceId: result.invoice.id,
      invoiceNumber: result.invoice.invoiceNumber,
    },
  };
}
