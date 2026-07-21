import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Logique partagée de génération de facture — utilisée par
 * generateInvoiceAction ET par la route GET de téléchargement du PDF.
 * Module serveur uniquement (jamais importé côté client).
 */

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
};

export type EnsureInvoiceResult =
  | { ok: true; invoice: InvoiceRecord }
  | { ok: false; error: string };

/**
 * Garantit qu'une facture existe pour la réservation (idempotent).
 * VÉRIFICATION : la réservation appartient au shop ET possède un paiement
 * `succeeded`. Numérotation séquentielle par shop : FAC-{YYYY}-{NNNN},
 * l'incrément étant le nombre de factures du shop sur l'année en cours + 1.
 */
export async function ensureInvoice(
  supabase: SupabaseClient,
  shopId: string,
  reservationId: string,
): Promise<EnsureInvoiceResult> {
  // VÉRIFICATION 1 : la réservation appartient bien au shop de l'appelant.
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .select("id")
    .eq("id", reservationId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (reservationError) return { ok: false, error: reservationError.message };
  if (!reservation) return { ok: false, error: "Réservation introuvable." };

  // VÉRIFICATION 2 : un paiement encaissé (succeeded) existe.
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("id")
    .eq("reservation_id", reservationId)
    .eq("status", "succeeded")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (paymentError) return { ok: false, error: paymentError.message };
  if (!payment) {
    return {
      ok: false,
      error: "Aucun paiement encaissé pour cette réservation.",
    };
  }

  // Idempotence : si une facture existe déjà, on la réutilise.
  const { data: existing, error: existingError } = await supabase
    .from("invoices")
    .select("id, invoice_number, created_at")
    .eq("reservation_id", reservationId)
    .maybeSingle();

  if (existingError) return { ok: false, error: existingError.message };
  if (existing) {
    return {
      ok: true,
      invoice: {
        id: existing.id,
        invoiceNumber: existing.invoice_number,
        createdAt: existing.created_at,
      },
    };
  }

  // Numéro séquentiel par shop et par année : FAC-{YYYY}-{NNNN}.
  // NB : comptage simple (pas de verrou) — en cas de génération strictement
  // concurrente sur le même shop, deux factures pourraient partager un numéro.
  // Acceptable pour un back-office mono-opérateur ; à durcir avec une séquence
  // SQL si le besoin apparaît.
  const year = new Date().getFullYear();
  const { count, error: countError } = await supabase
    .from("invoices")
    .select("id, reservations!inner(shop_id)", { count: "exact", head: true })
    .eq("reservations.shop_id", shopId)
    .like("invoice_number", `FAC-${year}-%`);

  if (countError) return { ok: false, error: countError.message };

  const sequence = String((count ?? 0) + 1).padStart(4, "0");
  const invoiceNumber = `FAC-${year}-${sequence}`;

  const { data: created, error: insertError } = await supabase
    .from("invoices")
    .insert({
      reservation_id: reservationId,
      payment_id: payment.id,
      invoice_number: invoiceNumber,
    })
    .select("id, invoice_number, created_at")
    .single();

  if (insertError) return { ok: false, error: insertError.message };

  return {
    ok: true,
    invoice: {
      id: created.id,
      invoiceNumber: created.invoice_number,
      createdAt: created.created_at,
    },
  };
}
