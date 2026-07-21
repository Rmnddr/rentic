"use client";

import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h2 className="text-h2 font-semibold">Une erreur est survenue</h2>
      <p className="text-body-sm text-muted-foreground">
        Impossible de charger les données d&apos;administration. Nous avons été
        notifiés.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
