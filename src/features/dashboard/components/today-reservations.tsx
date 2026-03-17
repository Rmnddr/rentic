import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Reservation = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  confirmed: { label: "Confirmée", variant: "default" },
  in_progress: { label: "En cours", variant: "secondary" },
};

export function TodayReservations({ reservations }: { reservations: Reservation[] }) {
  if (reservations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Réservations du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <span className="text-xl">🎿</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Aucune réservation aujourd&apos;hui
            </p>
            <p className="mt-1 text-caption text-muted-foreground">
              Profitez-en pour préparer le matériel !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">
          Réservations du jour
          <Badge variant="secondary" className="ml-2 tabular-nums">
            {reservations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reservations.map((res) => {
          const statusConfig = STATUS_LABELS[res.status] ?? {
            label: res.status,
            variant: "outline" as const,
          };

          return (
            <div
              key={res.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-secondary/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{res.customer_name}</p>
                {res.customer_phone && (
                  <p className="text-caption text-muted-foreground">
                    {res.customer_phone}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold tabular-nums text-primary">
                  {(res.total_price / 100).toFixed(0)}&nbsp;€
                </p>
                <Badge variant={statusConfig.variant}>
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
