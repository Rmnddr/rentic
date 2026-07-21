"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordCashPaymentAction } from "@/features/payments/actions";
import { formatCurrency } from "@/lib/utils/format-currency";
import { Banknote } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";

type CashPaymentDialogProps = {
  reservationId: string;
  customerName: string;
  /** Montant total de la réservation, en centimes */
  totalPrice: number;
};

/** Convertit une saisie en euros ("12,50" ou "12.50") en centimes entiers. */
function parseEurosToCents(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  const euros = Number.parseFloat(normalized);
  if (Number.isNaN(euros) || euros <= 0) return null;
  return Math.round(euros * 100);
}

export function CashPaymentDialog({
  reservationId,
  customerName,
  totalPrice,
}: CashPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState((totalPrice / 100).toFixed(2));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const amountId = useId();
  const router = useRouter();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      // Réinitialise la saisie à chaque ouverture (montant prérempli).
      setAmount((totalPrice / 100).toFixed(2));
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const cents = parseEurosToCents(amount);
    if (cents === null) {
      setError("Montant invalide. Saisissez un montant supérieur à zéro.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.set("reservationId", reservationId);
    formData.set("amount", String(cents));

    const result = await recordCashPaymentAction(formData);
    if (result.success) {
      setOpen(false);
      toast.success(
        `Paiement de ${formatCurrency(cents)} encaissé en espèces.`,
      );
      router.refresh();
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Banknote className="h-4 w-4" aria-hidden="true" />
          Encaisser
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Encaisser en espèces</DialogTitle>
          <DialogDescription>
            Enregistrez un paiement en espèces pour la réservation de{" "}
            {customerName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={amountId}>Montant encaissé (€)</Label>
            <Input
              id={amountId}
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-describedby={error ? `${amountId}-error` : undefined}
            />
          </div>
          {error && (
            <p
              id={`${amountId}-error`}
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer l'encaissement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
