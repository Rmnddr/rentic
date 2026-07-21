"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateFr, toIsoDate } from "@/lib/utils/format-date";
import { useTunnelStore } from "../store";
import type { AvailabilityMap } from "../types";

type AvailabilityResponse = {
  availability?: { productId: string; available: number }[];
};

export function StepDates({
  shopId,
  onAvailability,
  onNext,
}: {
  shopId: string;
  onAvailability: (map: AvailabilityMap) => void;
  onNext: () => void;
}) {
  const { startDate, endDate, setDates } = useTunnelStore();
  const [range, setRange] = useState<DateRange | undefined>(() =>
    startDate && endDate
      ? { from: new Date(startDate), to: new Date(endDate) }
      : undefined,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Rendu client uniquement : le calendrier dépend de "aujourd'hui", qui
  // diffère entre SSR et hydration (mismatch React sinon)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canContinue = Boolean(range?.from);

  async function handleContinue() {
    if (!range?.from) return;
    const start = toIsoDate(range.from);
    const end = toIsoDate(range.to ?? range.from);

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/availability?shopId=${encodeURIComponent(shopId)}&startDate=${start}&endDate=${end}`,
      );
      if (!res.ok) throw new Error();
      const body: AvailabilityResponse = await res.json();
      const map: AvailabilityMap = {};
      for (const entry of body.availability ?? []) {
        map[entry.productId] = entry.available;
      }
      setDates(start, end);
      onAvailability(map);
      onNext();
    } catch {
      setError("Impossible de vérifier les disponibilités. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="step-dates-title">
      <h2 id="step-dates-title" className="text-h2">
        Choisissez vos dates de location
      </h2>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Sélectionnez le premier et le dernier jour. Seul le matériel disponible
        sur toute la période vous sera proposé.
      </p>

      <div className="mt-6 flex justify-center rounded-lg border bg-card p-4">
        {mounted ? (
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            locale={fr}
            disabled={{ before: today }}
            className="[--cell-size:2.5rem]"
          />
        ) : (
          <Skeleton className="h-80 w-full max-w-xl" />
        )}
      </div>

      {range?.from && (
        <p className="mt-4 text-center text-body-sm">
          Du <strong>{formatDateFr(toIsoDate(range.from))}</strong> au{" "}
          <strong>{formatDateFr(toIsoDate(range.to ?? range.from))}</strong>
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 text-center text-body-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={handleContinue} disabled={!canContinue || loading}>
          {loading ? "Vérification des disponibilités…" : "Continuer"}
        </Button>
      </div>
    </section>
  );
}
