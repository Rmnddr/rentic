import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  confirmed: { label: "Confirmée", variant: "default" },
  in_progress: { label: "En cours", variant: "secondary" },
  completed: { label: "Terminée", variant: "outline" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

export default async function ReservationsPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, customer_name, customer_email, customer_phone, start_date, end_date, status, source, total_price, created_at")
    .order("start_date", { ascending: true });

  const upcoming = reservations?.filter(
    (r) => r.status === "confirmed" && r.start_date > today,
  ) ?? [];
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

          return (
            <div
              key={res.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-secondary/30"
            >
              <div className="min-w-0 flex-1">
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
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold tabular-nums">
                  {(res.total_price / 100).toFixed(0)}&nbsp;€
                </p>
                <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h1">Réservations</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Consultez et gérez vos réservations
        </p>
      </header>

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="upcoming" className="min-h-[44px]">
            À venir
            <Badge variant="secondary" className="ml-1.5 tabular-nums">
              {upcoming.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="min-h-[44px]">
            En cours
            <Badge variant="secondary" className="ml-1.5 tabular-nums">
              {inProgress.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past" className="min-h-[44px]">
            Passées
            <Badge variant="secondary" className="ml-1.5 tabular-nums">
              {past.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="min-h-[44px]">
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
    </div>
  );
}
