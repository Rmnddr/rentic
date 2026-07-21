"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTunnelStore } from "../store";
import type { TunnelCatalog, AvailabilityMap } from "../types";
import { StepDates } from "./step-dates";
import { StepCatalog } from "./step-catalog";
import { StepParticipants } from "./step-participants";
import { StepRecap } from "./step-recap";
import { StepPayment } from "./step-payment";

const BASE_STEPS = [
  { key: "dates", label: "Dates" },
  { key: "catalog", label: "Matériel" },
  { key: "participants", label: "Participants" },
  { key: "recap", label: "Confirmation" },
] as const;

const PAYMENT_STEP = { key: "payment", label: "Paiement" } as const;

type StepKey = (typeof BASE_STEPS)[number]["key"] | "payment";

export function BookingTunnel({ catalog }: { catalog: TunnelCatalog }) {
  const [step, setStep] = useState<StepKey>("dates");
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [payment, setPayment] = useState<{
    reservationId: string;
    amount: number;
  } | null>(null);
  const items = useTunnelStore((s) => s.items);

  const STEPS = catalog.onlinePayment ? [...BASE_STEPS, PAYMENT_STEP] : BASE_STEPS;

  // Les items du panier ont-ils des attributs participants à collecter ?
  const hasParticipantAttributes = items.some((item) =>
    catalog.participantAttributes.some((a) => a.category_id === item.categoryId),
  );

  const goFromCatalog = () =>
    setStep(hasParticipantAttributes ? "participants" : "recap");

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <Link
          href={`/s/${catalog.shopSlug}`}
          className="mb-4 inline-flex items-center gap-1 text-body-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Retour à la boutique
        </Link>
        <h1 className="text-h1">Réserver chez {catalog.shopName}</h1>

        <nav aria-label="Étapes de réservation" className="mt-6">
          <ol className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s.key} className="flex flex-1 flex-col gap-1.5">
                <span
                  className={`h-1.5 rounded-full ${
                    i <= stepIndex ? "bg-primary" : "bg-muted"
                  }`}
                  aria-hidden
                />
                <span
                  className={`text-caption ${
                    i === stepIndex
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                  aria-current={i === stepIndex ? "step" : undefined}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {step === "dates" && (
        <StepDates
          shopId={catalog.shopId}
          onAvailability={setAvailability}
          onNext={() => setStep("catalog")}
        />
      )}
      {step === "catalog" && (
        <StepCatalog
          catalog={catalog}
          availability={availability}
          onBack={() => setStep("dates")}
          onNext={goFromCatalog}
        />
      )}
      {step === "participants" && (
        <StepParticipants
          catalog={catalog}
          onBack={() => setStep("catalog")}
          onNext={() => setStep("recap")}
        />
      )}
      {step === "recap" && (
        <StepRecap
          catalog={catalog}
          onBack={() =>
            setStep(hasParticipantAttributes ? "participants" : "catalog")
          }
          onPayment={(reservationId, amount) => {
            setPayment({ reservationId, amount });
            setStep("payment");
          }}
        />
      )}
      {step === "payment" && payment && (
        <StepPayment
          catalog={catalog}
          reservationId={payment.reservationId}
          amount={payment.amount}
        />
      )}
    </div>
  );
}
