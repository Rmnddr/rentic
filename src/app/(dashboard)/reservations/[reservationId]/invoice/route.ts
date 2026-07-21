import { ensureInvoice } from "@/features/invoicing/generate-invoice";
import {
  renderInvoicePdf,
  type InvoiceLine,
} from "@/features/invoicing/invoice-pdf";
import { generateInvoiceSchema } from "@/lib/schemas/invoicing";
import { requireShop } from "@/lib/supabase/auth";
import { NextResponse } from "next/server";

// GET /reservations/[reservationId]/invoice — télécharge la facture PDF.
// Ordre NCF : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION.
// Génère la facture (numéro séquentiel) si elle n'existe pas encore, puis
// rend le PDF à la volée côté serveur (@react-pdf/renderer, jamais côté client).

// Le client Supabase non généré type l'embed FK `products` en tableau alors
// qu'il s'agit d'une relation to-one à l'exécution : on accepte les deux formes
// et on normalise via productName().
type ReservationItemRow = {
  quantity: number;
  unit_price: number;
  products: { name: string } | { name: string }[] | null;
};

function productName(products: ReservationItemRow["products"]): string {
  if (Array.isArray(products)) return products[0]?.name ?? "Article";
  return products?.name ?? "Article";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  // AUTH
  const auth = await requireShop();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // VALIDATION
  const { reservationId } = await params;
  const parsed = generateInvoiceSchema.safeParse({ reservationId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Identifiant de réservation invalide." },
      { status: 400 },
    );
  }

  // VÉRIFICATION : la réservation appartient au shop de l'appelant.
  const { data: reservation } = await auth.supabase
    .from("reservations")
    .select(
      "id, customer_name, customer_email, customer_phone, start_date, end_date, total_price, reservation_items(quantity, unit_price, products(name))",
    )
    .eq("id", reservationId)
    .eq("shop_id", auth.shopId)
    .maybeSingle();

  if (!reservation) {
    return NextResponse.json(
      { error: "Réservation introuvable." },
      { status: 404 },
    );
  }

  // OPÉRATION 1 : facture existante ou génération (vérifie aussi le paiement).
  const invoiceResult = await ensureInvoice(
    auth.supabase,
    auth.shopId,
    reservationId,
  );
  if (!invoiceResult.ok) {
    return NextResponse.json({ error: invoiceResult.error }, { status: 409 });
  }
  const { invoice } = invoiceResult;

  const { data: shop } = await auth.supabase
    .from("shops")
    .select("name, address, siret, tva_number, email, phone")
    .eq("id", auth.shopId)
    .single();

  if (!shop) {
    return NextResponse.json({ error: "Magasin introuvable." }, { status: 404 });
  }

  // Lignes de facture : items de la réservation, ou ligne unique de repli
  // pour les réservations créées sans items.
  const items: ReservationItemRow[] = reservation.reservation_items ?? [];
  const lines: InvoiceLine[] =
    items.length > 0
      ? items.map((item) => ({
          label: productName(item.products),
          quantity: item.quantity,
          unitPriceCents: item.unit_price,
          totalCents: item.quantity * item.unit_price,
        }))
      : [
          {
            label: "Location de matériel",
            quantity: 1,
            unitPriceCents: reservation.total_price,
            totalCents: reservation.total_price,
          },
        ];

  // OPÉRATION 2 : rendu PDF à la volée.
  const pdfBuffer = await renderInvoicePdf({
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.createdAt.slice(0, 10),
    shop: {
      name: shop.name,
      address: shop.address,
      siret: shop.siret,
      tvaNumber: shop.tva_number,
      email: shop.email,
      phone: shop.phone,
    },
    customerName: reservation.customer_name,
    customerEmail: reservation.customer_email,
    customerPhone: reservation.customer_phone,
    startDate: reservation.start_date,
    endDate: reservation.end_date,
    lines,
    totalCents: reservation.total_price,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
