import { MetricCard } from "@/features/dashboard/components/metric-card";
import { TodayReservations } from "@/features/dashboard/components/today-reservations";
import {
  getDashboardMetrics,
  getTodayReservations,
} from "@/features/dashboard/queries";
import { createClient } from "@/lib/supabase/server";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Clock,
  TrendingUp,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/(auth)/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name")
    .eq("id", user.id)
    .single();

  const isOwner = profile?.role === "owner";
  const greeting = profile?.first_name
    ? `Bonjour, ${profile.first_name}`
    : "Bonjour";

  const [metrics, todayReservations] = await Promise.all([
    isOwner ? getDashboardMetrics() : null,
    getTodayReservations(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header>
        <h1 className="text-h1">{greeting}</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          {isOwner
            ? "Voici un aperçu de votre activité"
            : "Voici les réservations du jour"}
        </p>
      </header>

      {/* Owner metrics */}
      {isOwner && metrics && (
        <section
          className="grid gap-4 sm:grid-cols-2"
          aria-label="Métriques clés"
        >
          <MetricCard
            title="Réservations du jour"
            value={metrics.reservationsToday.toString()}
            subtitle="en cours ou confirmées"
            icon={<CalendarDays className="h-4 w-4" />}
            accentColor="primary"
          />
          <MetricCard
            title="CA du mois"
            value={`${(metrics.monthlyRevenue / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €`}
            subtitle="paiements encaissés"
            icon={<ChartNoAxesCombined className="h-4 w-4" />}
            accentColor="success"
          />
          <MetricCard
            title="Taux d'occupation"
            value={`${metrics.occupancyRate} %`}
            subtitle="unités réservées / total"
            icon={<TrendingUp className="h-4 w-4" />}
            accentColor="accent"
          />
          <MetricCard
            title="À venir"
            value={metrics.upcomingReservations.toString()}
            subtitle="réservations confirmées"
            icon={<Clock className="h-4 w-4" />}
            accentColor="warning"
          />
        </section>
      )}

      {/* Today's reservations */}
      <section aria-label="Réservations du jour">
        <TodayReservations reservations={todayReservations} />
      </section>
    </div>
  );
}
