import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashPaymentDialog } from "@/features/payments/components/cash-payment-dialog";
import { CreateReservationDialog } from "@/features/reservations/components/create-reservation-dialog";
import { MaterialView } from "@/features/reservations/components/material-view";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { CalendarDays, FileText } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  confirmed: { label: "Confirmée", variant: "default" },
  in_progress: { label: "En cours", variant: "secondary" },
  completed: { label: "Terminée", variant: "outline" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

type Props = { searchParams: Promise<{ vue?: string }> };

export default async function ReservationsPage({ searchParams }: Props) {
  const { vue } = await searchParams;
  // Story 4.6 : toggle Vue Réservations ↔ Vue Matériel
  const materialView = vue === "materiel";

  const supabase = await createClient();
  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, customer_name, customer_email, customer_phone, start_date, end_date, status, source, total_price, created_at")
    .order("start_date", { ascending: true });

  // Statut de paiement : une réservation est "Payée" dès qu'un paiement
  // succeeded existe (RLS limite déjà les payments au shop de l'utilisateur).
  const { data: succeededPayments } = await supabase
    .from("payments")
    .select("reservation_id")
    .eq("status", "succeeded");

  const paidReservationIds = new Set(
    succeededPayments?.map((p) => p.reservation_id) ?? [],
  );

  // Toutes les confirmées sont « à venir » (pas encore démarrées) : filtrer
  // aussi sur la date faisait disparaître de tous les onglets une réservation
  // confirmée démarrant aujourd'hui ou en retard de démarrage.
  const upcoming = reservations?.filter((r) => r.status === "confirmed") ?? [];
  const inProgress = reservations?.filter(
    (r) => r.status === "in_progress",
  ) ?? [];
  const past = reservations?.filter(
    (r) => r.status === "completed",
  ) ?? [];
  const cancelled = reservations?.filter(
    (r) => r.status === "cancelled",
  ) ?? [];

  function ReservationList({ items }: { items: typeof upcoming }) {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-body-sm text-muted-foreground">
            Aucune réservation
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((res) => {
          const statusCfg = STATUS_CONFIG[res.status] ?? {
            label: res.status,
            variant: "outline" as const,
          };
          const isPaid = paidReservationIds.has(res.id);

          return (
            <div
              key={res.id}
              className="flex items-center justify-between rounded-lg bg-muted/40 p-4 transition-colors hover:bg-secondary/30"
            >
              <Link
                href={`/reservations/${res.id}`}
                className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Ouvrir la réservation de ${res.customer_name}`}
              >
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{res.customer_name}</p>
                  {res.source === "web" && (
                    <Badge variant="outline" className="text-[10px]">
                      Web
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {new Date(res.start_date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  →{" "}
                  {new Date(res.end_date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </Link>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold tabular-nums">
                  {(res.total_price / 100).toFixed(0)}&nbsp;€
                </p>
                {isPaid ? (
                  <Badge className="border-transparent bg-success/10 text-success">
                    Payée
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    En attente
                  </Badge>
                )}
                <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                {isPaid && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <a
                      href={`/reservations/${res.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Télécharger la facture de ${res.customer_name}`}
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Facture
                    </a>
                  </Button>
                )}
                {!isPaid && res.status !== "cancelled" && (
                  <CashPaymentDialog
                    reservationId={res.id}
                    customerName={res.customer_name}
                    totalPrice={res.total_price}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Réservations</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Consultez et gérez vos réservations
          </p>
        </div>
        <CreateReservationDialog />
      </header>

      {/* Story 4.6 : bascule entre la vue par réservations et la vue matériel */}
      <nav
        aria-label="Mode d'affichage"
        className="flex w-fit gap-1 rounded-full bg-muted p-1"
      >
        <Link
          href="/reservations"
          aria-current={!materialView ? "page" : undefined}
          className={cn(
            "rounded-full px-4 py-2 text-sm transition-all",
            !materialView
              ? "bg-surface font-semibold text-primary shadow-organic-sm"
              : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Réservations
        </Link>
        <Link
          href="/reservations?vue=materiel"
          aria-current={materialView ? "page" : undefined}
          className={cn(
            "rounded-full px-4 py-2 text-sm transition-all",
            materialView
              ? "bg-surface font-semibold text-primary shadow-organic-sm"
              : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          Matériel
        </Link>
      </nav>

      {materialView ? (
        <MaterialView />
      ) : (
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            À venir
            <Badge variant="secondary" className="ml-1.5 tabular-nums">
              {upcoming.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            En cours
            <Badge variant="secondary" className="ml-1.5 tabular-nums">
              {inProgress.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past">
            Passées
            <Badge variant="secondary" className="ml-1.5 tabular-nums">
              {past.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Annulées
            <Badge variant="secondary" className="ml-1.5 tabular-nums">
              {cancelled.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <TabsContent value="upcoming" className="m-0">
            <CardContent className="pt-6">
              <ReservationList items={upcoming} />
            </CardContent>
          </TabsContent>
          <TabsContent value="in_progress" className="m-0">
            <CardContent className="pt-6">
              <ReservationList items={inProgress} />
            </CardContent>
          </TabsContent>
          <TabsContent value="past" className="m-0">
            <CardContent className="pt-6">
              <ReservationList items={past} />
            </CardContent>
          </TabsContent>
          <TabsContent value="cancelled" className="m-0">
            <CardContent className="pt-6">
              <ReservationList items={cancelled} />
            </CardContent>
          </TabsContent>
        </Card>
      </Tabs>
      )}
    </div>
  );
}
