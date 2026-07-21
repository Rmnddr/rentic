"use client";

import { useActionState } from "react";
import { CircleCheckIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createStripeConnectAction } from "@/features/payments/actions";
import type { ActionResult } from "@/types/global";

// État du compte Connect du magasin, lu côté serveur (page settings)
// dans `shop_stripe_accounts` et passé en props.
type StripeAccountStatus = {
  charges_enabled: boolean;
  payouts_enabled: boolean;
};

type Props = {
  account: StripeAccountStatus | null;
  /** Query param `?stripe=` renvoyé par Stripe (return_url / refresh_url). */
  notice: "success" | "refresh" | null;
};

// L'action redirige vers Stripe en cas de succès (redirect → jamais de
// retour "success" ici) ; on ne récupère un state que si elle échoue avant.
type ConnectState = ActionResult<{ url: string }> | null;

export function StripeConnectCard({ account, notice }: Props) {
  const [state, formAction, isPending] = useActionState<ConnectState, FormData>(
    () => createStripeConnectAction(),
    null,
  );

  const isActive = account?.charges_enabled === true;
  const isIncomplete = account !== null && !account.charges_enabled;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-h3">Paiements en ligne</CardTitle>
          {isActive && (
            <Badge className="border-transparent bg-success text-success-foreground">
              Actif
            </Badge>
          )}
          {isIncomplete && (
            <Badge variant="outline">Configuration incomplète</Badge>
          )}
        </div>
        <CardDescription>
          Encaissez vos clients par carte bancaire via Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notice === "success" && (
          <Alert>
            <CircleCheckIcon aria-hidden="true" className="text-success" />
            <AlertTitle>Configuration Stripe terminée</AlertTitle>
            <AlertDescription>
              L&apos;activation de votre compte peut prendre quelques minutes.
            </AlertDescription>
          </Alert>
        )}
        {notice === "refresh" && (
          <Alert>
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>Configuration interrompue</AlertTitle>
            <AlertDescription>
              Vous pouvez reprendre là où vous en étiez.
            </AlertDescription>
          </Alert>
        )}

        {isActive ? (
          <div className="space-y-3">
            <p className="text-body-sm text-muted-foreground">
              Vos clients peuvent payer en ligne par carte.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">
                Virements vers votre banque
              </span>
              {account.payouts_enabled ? (
                <Badge className="border-transparent bg-success text-success-foreground">
                  Activés
                </Badge>
              ) : (
                <Badge variant="outline">En attente</Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-body-sm text-muted-foreground">
              {isIncomplete
                ? "Votre compte Stripe est créé mais sa configuration n'est pas terminée. Reprenez-la pour accepter les paiements par carte."
                : "Connectez un compte Stripe pour permettre à vos clients de payer leurs réservations en ligne par carte."}
            </p>
            <form action={formAction}>
              <Button type="submit" disabled={isPending} aria-busy={isPending}>
                {isPending
                  ? "Redirection vers Stripe…"
                  : isIncomplete
                    ? "Reprendre la configuration"
                    : "Activer les paiements en ligne"}
              </Button>
            </form>
            {state !== null && !state.success && (
              <p role="alert" className="text-sm text-destructive">
                Erreur : {state.error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
