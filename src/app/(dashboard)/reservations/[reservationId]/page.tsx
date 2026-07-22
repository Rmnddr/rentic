import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Package, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CashPaymentDialog } from "@/features/payments/components/cash-payment-dialog";
import { ReservationStatusActions } from "@/features/reservations/components/reservation-status-actions";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateFr } from "@/lib/utils/format-date";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  confirmed: { label: "Confirmée", variant: "default" },
  in_progress: { label: "En cours", variant: "secondary" },
  completed: { label: "Terminée", variant: "outline" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  card: "Carte bancaire",
  cash: "Espèces",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  succeeded: "Encaissé",
  failed: "Échoué",
  refunded: "Remboursé",
};

type Props = { params: Promise<{ reservationId: string }> };

export default async function ReservationDetailPage({ params }: Props) {
  const { reservationId } = await params;
  const supabase = await createClient();

  // RLS restreint déjà aux réservations du shop : un id étranger → null.
  const { data: reservation } = await supabase
    .from("reservations")
    .select(
      `id, customer_name, customer_email, customer_phone, start_date, end_date,
       status, source, total_price, notes, created_at,
       reservation_items (
         id, quantity, unit_price, is_optional, pack_id,
         products ( name ),
         packs ( name ),
         reservation_unit_assignments ( product_units ( label ) ),
         participant_attribute_values (
           value, participant_index,
           category_attributes ( name )
         )
       )`,
    )
    .eq("id", reservationId)
    .single();

  if (!reservation) notFound();

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, status, method, created_at")
    .eq("reservation_id", reservation.id)
    .order("created_at", { ascending: true });

  const isPaid = (payments ?? []).some((p) => p.status === "succeeded");
  const statusCfg = STATUS_CONFIG[reservation.status] ?? {
    label: reservation.status,
    variant: "outline" as const,
  };

  const items = reservation.reservation_items ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/reservations"
        className="inline-flex items-center gap-1 text-body-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Toutes les réservations
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-h1">{reservation.customer_name}</h1>
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            {reservation.source === "web" && (
              <Badge variant="outline">Web</Badge>
            )}
          </div>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Du <strong>{formatDateFr(reservation.start_date)}</strong> au{" "}
            <strong>{formatDateFr(reservation.end_date)}</strong>
          </p>
        </div>
        <ReservationStatusActions
          reservationId={reservation.id}
          status={reservation.status}
          customerName={reservation.customer_name}
        />
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h3">
              <User className="size-5 text-primary" aria-hidden />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-body-sm">
            <p className="font-medium">{reservation.customer_name}</p>
            {reservation.customer_email && <p>{reservation.customer_email}</p>}
            {reservation.customer_phone && (
              <p className="tabular-nums">{reservation.customer_phone}</p>
            )}
            {!reservation.customer_email && !reservation.customer_phone && (
              <p className="text-muted-foreground">Aucune coordonnée renseignée.</p>
            )}
            {reservation.notes && (
              <>
                <Separator className="my-2" />
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {reservation.notes}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-h3">
              <span>Paiement</span>
              {isPaid ? (
                <Badge className="border-transparent bg-success/10 text-success">
                  Payée
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  En attente
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(payments ?? []).length > 0 ? (
              <ul className="space-y-1.5 text-body-sm">
                {(payments ?? []).map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between">
                    <span>
                      {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method} ·{" "}
                      <span className="text-muted-foreground">
                        {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                      </span>
                    </span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(payment.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-muted-foreground">
                Aucun paiement enregistré.
              </p>
            )}
            <Separator />
            <p className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatCurrency(reservation.total_price)}
              </span>
            </p>
            <div className="flex gap-2">
              {!isPaid && reservation.status !== "cancelled" && (
                <CashPaymentDialog
                  reservationId={reservation.id}
                  customerName={reservation.customer_name}
                  totalPrice={reservation.total_price}
                />
              )}
              {isPaid && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <a
                    href={`/reservations/${reservation.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="size-4" aria-hidden />
                    Télécharger la facture
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matériel & participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-h3">
            <Package className="size-5 text-primary" aria-hidden />
            Matériel réservé
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">
              Aucun article sur cette réservation.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => {
                const units = (item.reservation_unit_assignments ?? [])
                  .map((a) => a.product_units?.label)
                  .filter((label): label is string => Boolean(label));

                // Attributs participants groupés par exemplaire (index)
                const participants = new Map<number, { name: string; value: string }[]>();
                for (const pav of item.participant_attribute_values ?? []) {
                  const name = pav.category_attributes?.name;
                  if (!name || pav.value === null) continue;
                  const list = participants.get(pav.participant_index) ?? [];
                  list.push({ name, value: pav.value });
                  participants.set(pav.participant_index, list);
                }

                return (
                  <li key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {/* div et non p : Badge rend un <div>, invalide dans un <p> */}
                        <div className="flex flex-wrap items-center gap-2 font-medium">
                          <span>
                            {item.products?.name ?? "Produit supprimé"}
                            {item.quantity > 1 && (
                              <span className="text-muted-foreground">
                                {" "}
                                × {item.quantity}
                              </span>
                            )}
                          </span>
                          {item.packs?.name && (
                            <Badge variant="secondary">{item.packs.name}</Badge>
                          )}
                          {item.is_optional && (
                            <Badge variant="outline">Option</Badge>
                          )}
                        </div>
                        {units.length > 0 && (
                          <p className="mt-1 text-caption text-muted-foreground">
                            Unités : {units.join(", ")}
                          </p>
                        )}
                        {[...participants.entries()]
                          .sort(([a], [b]) => a - b)
                          .map(([index, values]) => (
                            <p
                              key={index}
                              className="mt-1 text-caption text-muted-foreground"
                            >
                              Participant {index + 1} —{" "}
                              {values.map((v) => `${v.name} : ${v.value}`).join(" · ")}
                            </p>
                          ))}
                      </div>
                      <p className="shrink-0 text-body-sm font-medium tabular-nums">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
