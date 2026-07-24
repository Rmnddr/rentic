import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDateFr, toIsoDate, todayIso } from "@/lib/utils/format-date";
import { PackageOpen } from "lucide-react";
import Link from "next/link";

/**
 * « À préparer (7 jours) » (story 8.3) : les réservations confirmées qui
 * démarrent dans les 7 prochains jours, avec le nombre d'articles et les
 * attributs participants (ex. « Pointure : 42 ») pour préparer le matériel
 * à l'avance. RLS scope déjà au shop.
 */
export async function UpcomingPreparations() {
  const supabase = await createClient();
  const today = todayIso();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 7);
  const horizonIso = toIsoDate(horizon);

  const { data: reservations } = await supabase
    .from("reservations")
    .select(
      `id, customer_name, start_date,
       reservation_items(
         id, quantity,
         participant_attribute_values(
           value, participant_index,
           category_attributes!inner(name)
         )
       )`,
    )
    .eq("status", "confirmed")
    .gte("start_date", today)
    .lte("start_date", horizonIso)
    .order("start_date", { ascending: true })
    .limit(100);

  const rows = (reservations ?? []).map((reservation) => {
    const itemCount = reservation.reservation_items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // Regroupe les valeurs par nom d'attribut : « Pointure : 42, 44 »
    const valuesByAttribute = new Map<string, string[]>();
    for (const item of reservation.reservation_items) {
      for (const attr of item.participant_attribute_values) {
        if (!attr.value) continue;
        const name = attr.category_attributes.name;
        const values = valuesByAttribute.get(name) ?? [];
        values.push(attr.value);
        valuesByAttribute.set(name, values);
      }
    }
    const attributes = [...valuesByAttribute.entries()].map(
      ([name, values]) => `${name} : ${values.join(", ")}`,
    );

    return {
      id: reservation.id,
      customerName: reservation.customer_name,
      startDate: reservation.start_date,
      itemCount,
      attributes,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">
          À préparer (7 jours)
          {rows.length > 0 && (
            <Badge variant="secondary" className="ml-2 tabular-nums">
              {rows.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className={rows.length > 0 ? "space-y-3" : undefined}>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <PackageOpen
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Rien à préparer sur les 7 prochains jours
            </p>
          </div>
        ) : (
          rows.map((row) => (
            <Link
              key={row.id}
              href={`/reservations/${row.id}`}
              aria-label={`Voir la réservation de ${row.customerName} du ${formatDateFr(row.startDate)}`}
              className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 p-3 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{row.customerName}</p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {formatDateFr(row.startDate)} ·{" "}
                  {row.itemCount > 1
                    ? `${row.itemCount} articles`
                    : "1 article"}
                </p>
                {row.attributes.length > 0 && (
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {row.attributes.map((attribute) => (
                      <li key={attribute}>
                        <Badge
                          variant="outline"
                          className="font-normal text-muted-foreground"
                        >
                          {attribute}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
