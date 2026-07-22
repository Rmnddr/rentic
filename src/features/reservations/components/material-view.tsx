import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDateFr, toIsoDate, todayIso } from "@/lib/utils/format-date";
import { Package } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  confirmed: { label: "Confirmée", variant: "default" },
  in_progress: { label: "En cours", variant: "secondary" },
};

type UnitLine = {
  assignmentId: string;
  unitLabel: string;
  reservationId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  status: string;
};

type ProductGroup = {
  productId: string;
  productName: string;
  units: UnitLine[];
};

/**
 * Vue « Matériel » (story 4.6) : ce qui sort / est dehors sur les 7 prochains
 * jours, groupé par produit puis trié par date de début. Une unité physique
 * n'apparaît que si elle est assignée à une réservation confirmée ou en cours
 * dont la période chevauche [aujourd'hui, J+7]. RLS scope déjà au shop.
 */
export async function MaterialView() {
  const supabase = await createClient();
  const today = todayIso();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 7);
  const horizonIso = toIsoDate(horizon);

  // Jointures imbriquées !inner : le filtre statut/période s'applique côté
  // SQL et exclut les assignations hors fenêtre (pas de tri en mémoire).
  const { data: assignments } = await supabase
    .from("reservation_unit_assignments")
    .select(
      `id,
       product_units!inner(id, label, products!inner(id, name)),
       reservation_items!inner(
         id,
         reservations!inner(id, customer_name, start_date, end_date, status)
       )`,
    )
    .in("reservation_items.reservations.status", ["confirmed", "in_progress"])
    .lte("reservation_items.reservations.start_date", horizonIso)
    .gte("reservation_items.reservations.end_date", today)
    .limit(100);

  const groupsById = new Map<string, ProductGroup>();
  for (const assignment of assignments ?? []) {
    const product = assignment.product_units.products;
    const reservation = assignment.reservation_items.reservations;

    let group = groupsById.get(product.id);
    if (!group) {
      group = { productId: product.id, productName: product.name, units: [] };
      groupsById.set(product.id, group);
    }
    group.units.push({
      assignmentId: assignment.id,
      unitLabel: assignment.product_units.label,
      reservationId: reservation.id,
      customerName: reservation.customer_name,
      startDate: reservation.start_date,
      endDate: reservation.end_date,
      status: reservation.status,
    });
  }

  const groups = [...groupsById.values()].sort((a, b) =>
    a.productName.localeCompare(b.productName, "fr"),
  );
  for (const group of groups) {
    group.units.sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        a.unitLabel.localeCompare(b.unitLabel, "fr"),
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Package
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="text-body-sm text-muted-foreground">
              Aucun matériel réservé sur les 7 prochains jours
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.productId}>
          <CardHeader>
            <CardTitle className="text-h3">
              {group.productName}
              <Badge variant="secondary" className="ml-2 tabular-nums">
                {group.units.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.units.map((unit) => {
              const statusCfg = STATUS_CONFIG[unit.status] ?? {
                label: unit.status,
                variant: "outline" as const,
              };

              return (
                <Link
                  key={unit.assignmentId}
                  href={`/reservations/${unit.reservationId}`}
                  aria-label={`Voir la réservation de ${unit.customerName} — ${group.productName} ${unit.unitLabel}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{unit.unitLabel}</p>
                    <p className="mt-0.5 truncate text-caption text-muted-foreground">
                      {unit.customerName} · du {formatDateFr(unit.startDate)} au{" "}
                      {formatDateFr(unit.endDate)}
                    </p>
                  </div>
                  <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
