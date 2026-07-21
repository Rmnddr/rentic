"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format-currency";
import { createTunnelPaymentAction } from "../actions";
import type { TunnelCatalog } from "../types";

// Clé publique inlinée au build (NEXT_PUBLIC_*) — jamais la clé secrète ici.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

export function StepPayment({
  catalog,
  reservationId,
  amount,
}: {
  catalog: TunnelCatalog;
  reservationId: string;
  amount: number;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createTunnelPaymentAction({ reservationId }).then((result) => {
      if (cancelled) return;
      if (result.success) setClientSecret(result.data.clientSecret);
      else setError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [reservationId]);

  return (
    <section aria-labelledby="step-payment-title">
      <h2 id="step-payment-title" className="text-h2">
        Paiement
      </h2>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Votre réservation est enregistrée. Réglez{" "}
        <strong className="text-foreground tabular-nums">
          {formatCurrency(amount)}
        </strong>{" "}
        pour la finaliser — paiement sécurisé par Stripe.
      </p>

      {error && (
        <p role="alert" className="mt-4 text-body-sm text-destructive">
          {error}
        </p>
      )}

      {!clientSecret && !error && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-9 w-40" />
        </div>
      )}

      {clientSecret && (
        <div className="mt-6 rounded-lg border bg-card p-4">
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, locale: "fr" }}
          >
            <PaymentForm
              returnUrl={`${window.location.origin}/s/${catalog.shopSlug}/reserver/confirmation?ref=${reservationId}`}
              amount={amount}
            />
          </Elements>
        </div>
      )}
    </section>
  );
}

function PaymentForm({ returnUrl, amount }: { returnUrl: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    // On n'arrive ici qu'en cas d'échec (sinon Stripe redirige)
    setError(stripeError.message ?? "Le paiement a échoué. Veuillez réessayer.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <p role="alert" className="mt-3 text-body-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-4 w-full" disabled={!stripe || submitting}>
        {submitting ? "Paiement en cours…" : `Payer ${formatCurrency(amount)}`}
      </Button>
    </form>
  );
}
