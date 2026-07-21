"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDateFr } from "@/lib/utils/format-date";
import { createWebReservationAction } from "../actions";
import { useTunnelStore } from "../store";
import type { TunnelCatalog } from "../types";

export function StepRecap({
  catalog,
  onBack,
}: {
  catalog: TunnelCatalog;
  onBack: () => void;
}) {
  const router = useRouter();
  const { startDate, endDate, items, participantValues, reset } = useTunnelStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptCgv, setAcceptCgv] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await createWebReservationAction({
        shopId: catalog.shopId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        startDate,
        endDate,
        items: items.map((i) => ({
          productId: i.productId,
          packId: i.packId,
          quantity: i.quantity,
          isOptional: i.isOptional,
        })),
        participantValues,
        acceptCgv,
      });

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      // Naviguer AVANT de vider le store : reset() re-rend ce composant,
      // qui a encore besoin des dates tant que la confirmation n'est pas là
      router.push(
        `/s/${catalog.shopSlug}/reserver/confirmation?ref=${result.data.reservationId}`,
      );
      reset();
    });
  }

  return (
    <section aria-labelledby="step-recap-title">
      <h2 id="step-recap-title" className="text-h2">
        Récapitulatif
      </h2>

      <div className="mt-6 rounded-lg border bg-card p-4">
        <p className="text-body-sm text-muted-foreground">
          Du <strong className="text-foreground">{formatDateFr(startDate)}</strong>{" "}
          au <strong className="text-foreground">{formatDateFr(endDate)}</strong>
        </p>
        <ul className="mt-3 space-y-1.5">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between text-body-sm"
            >
              <span>
                {item.productName}
                {item.packName && (
                  <span className="text-muted-foreground"> — {item.packName}</span>
                )}{" "}
                × {item.quantity}
              </span>
              <span className="tabular-nums">
                {formatCurrency(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatCurrency(total)}</span>
        </p>
        <p className="mt-1 text-caption text-muted-foreground">
          Paiement sur place au moment du retrait du matériel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="recap-name">Nom complet</Label>
          <Input
            id="recap-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
            autoComplete="name"
          />
          {fieldErrors.customerName && (
            <p role="alert" className="text-caption text-destructive">
              {fieldErrors.customerName[0]}
            </p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="recap-email">Email</Label>
            <Input
              id="recap-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={320}
              autoComplete="email"
            />
            {fieldErrors.customerEmail && (
              <p role="alert" className="text-caption text-destructive">
                {fieldErrors.customerEmail[0]}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="recap-phone">Téléphone (optionnel)</Label>
            <Input
              id="recap-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={30}
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="recap-cgv"
            checked={acceptCgv}
            onCheckedChange={(checked) => setAcceptCgv(checked === true)}
            required
          />
          <Label htmlFor="recap-cgv" className="font-normal leading-snug">
            J&apos;accepte les{" "}
            {catalog.hasCgv ? (
              <Link
                href={`/s/${catalog.shopSlug}/cgv`}
                target="_blank"
                className="underline"
              >
                conditions générales de vente
              </Link>
            ) : (
              "conditions générales de vente"
            )}
          </Label>
        </div>

        {error && (
          <p role="alert" className="text-body-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button type="submit" disabled={pending || !acceptCgv || items.length === 0}>
            {pending ? "Réservation en cours…" : "Confirmer la réservation"}
          </Button>
        </div>
      </form>
    </section>
  );
}
