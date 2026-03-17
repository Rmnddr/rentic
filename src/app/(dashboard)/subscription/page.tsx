import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { CreditCard } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  trialing: { label: "Essai gratuit", color: "bg-accent/10 text-accent-foreground" },
  active: { label: "Actif", color: "bg-success/10 text-success" },
  past_due: { label: "Impayé", color: "bg-warning/10 text-warning" },
  canceled: { label: "Annulé", color: "bg-destructive/10 text-destructive" },
  expired: { label: "Expiré", color: "bg-muted text-muted-foreground" },
};

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("shop_id", shopId ?? "")
    .single();

  const statusConfig = subscription
    ? STATUS_LABELS[subscription.status] ?? { label: subscription.status, color: "bg-muted text-muted-foreground" }
    : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h1">Abonnement</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Gérez votre plan et votre facturation
        </p>
      </header>

      {subscription ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-h3">
                <CreditCard className="h-5 w-5 text-primary" />
                Plan actuel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Statut</span>
                <Badge className={statusConfig?.color}>
                  {statusConfig?.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Plan</span>
                <span className="font-medium capitalize">
                  {subscription.plan === "trial"
                    ? "Essai"
                    : subscription.plan === "season"
                      ? "Saison (450 €)"
                      : "Annuel (790 €)"}
                </span>
              </div>
              {subscription.trial_ends_at && subscription.status === "trialing" && (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">
                    Fin de l&apos;essai
                  </span>
                  <span className="tabular-nums">
                    {new Date(subscription.trial_ends_at).toLocaleDateString(
                      "fr-FR",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </span>
                </div>
              )}
              {subscription.current_period_end && (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">
                    Prochaine facturation
                  </span>
                  <span className="tabular-nums">
                    {new Date(
                      subscription.current_period_end,
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {subscription.status === "trialing" && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-h3">
                  Choisissez votre plan
                </CardTitle>
                <CardDescription>
                  Passez au plan payant avant la fin de votre essai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Saison</p>
                      <p className="text-caption text-muted-foreground">
                        6 mois de location
                      </p>
                    </div>
                    <p className="text-h2 tabular-nums text-primary">450 €</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Annuel</p>
                      <p className="text-caption text-muted-foreground">
                        12 mois — meilleur rapport
                      </p>
                    </div>
                    <p className="text-h2 tabular-nums text-primary">790 €</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CreditCard className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-h3">Aucun abonnement</h2>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Complétez l&apos;onboarding pour activer votre essai gratuit
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
