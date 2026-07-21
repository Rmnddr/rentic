import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LatestShopsTable } from "@/features/admin/components/latest-shops-table";
import { getPlatformOverview } from "@/features/admin/queries";
import { MetricCard } from "@/features/dashboard/components/metric-card";
import { formatCurrency } from "@/lib/utils/format-currency";
import {
  AlertTriangle,
  CalendarDays,
  ChartNoAxesCombined,
  CircleCheck,
  Hourglass,
  Store,
  TrendingUp,
  UserMinus,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const overview = await getPlatformOverview();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-h1">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Santé de la plateforme : loueurs, abonnements et activité
        </p>
      </header>

      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Loueurs et abonnements"
      >
        <MetricCard
          title="Loueurs inscrits"
          value={overview.shopsTotal.toString()}
          subtitle="magasins créés au total"
          icon={<Store className="h-4 w-4" />}
          accentColor="primary"
        />
        <MetricCard
          title="Loueurs actifs"
          value={overview.shopsActive.toString()}
          subtitle="abonnement actif"
          icon={<CircleCheck className="h-4 w-4" />}
          accentColor="success"
        />
        <MetricCard
          title="En période d'essai"
          value={overview.shopsTrialing.toString()}
          subtitle="essai en cours"
          icon={<Hourglass className="h-4 w-4" />}
          accentColor="accent"
        />
        <MetricCard
          title="Impayés"
          value={overview.shopsPastDue.toString()}
          subtitle="paiement en échec"
          icon={<AlertTriangle className="h-4 w-4" />}
          accentColor="warning"
        />
        <MetricCard
          title="Résiliés ou expirés"
          value={overview.shopsChurned.toString()}
          subtitle="abonnement terminé"
          icon={<UserMinus className="h-4 w-4" />}
          accentColor="warning"
        />
        <MetricCard
          title="MRR estimé"
          value={formatCurrency(overview.estimatedMrrCents)}
          subtitle="annuel ÷ 12, saison ÷ 6"
          icon={<TrendingUp className="h-4 w-4" />}
          accentColor="primary"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Activité">
        <MetricCard
          title="Réservations"
          value={overview.reservationsTotal.toString()}
          subtitle="toutes plateformes confondues"
          icon={<CalendarDays className="h-4 w-4" />}
          accentColor="primary"
        />
        <MetricCard
          title="Chiffre d'affaires encaissé"
          value={formatCurrency(overview.collectedRevenueCents)}
          subtitle="paiements encaissés depuis le lancement"
          icon={<ChartNoAxesCombined className="h-4 w-4" />}
          accentColor="success"
        />
      </section>

      <section aria-label="Derniers loueurs inscrits">
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">Derniers inscrits</CardTitle>
          </CardHeader>
          <CardContent>
            <LatestShopsTable shops={overview.latestShops} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
