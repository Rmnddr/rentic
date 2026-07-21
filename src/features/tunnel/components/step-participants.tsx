"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTunnelStore } from "../store";
import type { TunnelAttribute, TunnelCatalog } from "../types";

// Attributs participants (EAV) : pour chaque item du panier et chaque
// exemplaire loué, le loueur a défini les champs à collecter (pointure,
// poids, taille…) selon la catégorie du produit.

export function StepParticipants({
  catalog,
  onBack,
  onNext,
}: {
  catalog: TunnelCatalog;
  onBack: () => void;
  onNext: () => void;
}) {
  const { items, participantValues, setParticipantValue } = useTunnelStore();

  const attributesFor = (categoryId: string): TunnelAttribute[] =>
    catalog.participantAttributes.filter((a) => a.category_id === categoryId);

  const valueOf = (itemIndex: number, attributeId: string, participantIndex: number) =>
    participantValues.find(
      (pv) =>
        pv.itemIndex === itemIndex &&
        pv.attributeId === attributeId &&
        pv.participantIndex === participantIndex,
    )?.value ?? "";

  const missingRequired = items.some((item, itemIndex) =>
    attributesFor(item.categoryId).some(
      (attr) =>
        attr.required &&
        Array.from({ length: item.quantity }).some(
          (_, pi) => valueOf(itemIndex, attr.id, pi).trim() === "",
        ),
    ),
  );

  return (
    <section aria-labelledby="step-participants-title">
      <h2 id="step-participants-title" className="text-h2">
        Informations participants
      </h2>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Ces informations permettent au loueur de préparer un matériel adapté à
        chaque participant.
      </p>

      <div className="mt-6 space-y-6">
        {items.map((item, itemIndex) => {
          const attributes = attributesFor(item.categoryId);
          if (attributes.length === 0) return null;
          return (
            <div
              key={`${item.productId}-${item.packId ?? "solo"}`}
              className="rounded-lg border bg-card p-4"
            >
              <h3 className="font-medium">
                {item.productName}
                {item.quantity > 1 && (
                  <span className="text-muted-foreground"> × {item.quantity}</span>
                )}
              </h3>
              <div className="mt-3 space-y-4">
                {Array.from({ length: item.quantity }).map((_, participantIndex) => (
                  <fieldset key={participantIndex} className="rounded-md border p-3">
                    <legend className="px-1 text-body-sm text-muted-foreground">
                      Participant {participantIndex + 1}
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {attributes.map((attr) => {
                        const fieldId = `pv-${itemIndex}-${participantIndex}-${attr.id}`;
                        const current = valueOf(itemIndex, attr.id, participantIndex);
                        const onChange = (value: string) =>
                          setParticipantValue({
                            itemIndex,
                            attributeId: attr.id,
                            value,
                            participantIndex,
                          });
                        return (
                          <div key={attr.id} className="space-y-1.5">
                            <Label htmlFor={fieldId}>
                              {attr.name}
                              {attr.required && (
                                <span aria-hidden className="text-destructive">
                                  {" "}
                                  *
                                </span>
                              )}
                            </Label>
                            {attr.format === "select" && attr.options ? (
                              <Select value={current} onValueChange={onChange}>
                                <SelectTrigger
                                  id={fieldId}
                                  aria-required={attr.required}
                                  className="w-full"
                                >
                                  <SelectValue placeholder="Choisir…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {attr.options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={fieldId}
                                type={attr.format === "number" ? "number" : "text"}
                                value={current}
                                required={attr.required}
                                maxLength={2000}
                                onChange={(e) => onChange(e.target.value)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onNext} disabled={missingRequired}>
          Continuer
        </Button>
      </div>
      {missingRequired && (
        <p className="mt-2 text-right text-caption text-muted-foreground">
          Renseignez les champs obligatoires (*) pour continuer.
        </p>
      )}
    </section>
  );
}
