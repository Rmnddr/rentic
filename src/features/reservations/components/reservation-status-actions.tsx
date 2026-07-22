"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateReservationStatusAction } from "../actions";

// Story 4.4 : cycle de vie d'une réservation.
// Les transitions valides sont vérifiées côté serveur (l'action refuse le
// reste) ; ce composant ne propose que celles qui ont du sens depuis le
// statut courant : confirmed → in_progress | cancelled,
// in_progress → completed | cancelled. completed/cancelled sont terminaux.

export function ReservationStatusActions({
  reservationId,
  status,
  customerName,
}: {
  reservationId: string;
  status: string;
  customerName: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);

  function transition(newStatus: string, successMessage: string) {
    const formData = new FormData();
    formData.set("id", reservationId);
    formData.set("status", newStatus);

    startTransition(async () => {
      const result = await updateReservationStatusAction(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCancelOpen(false);
      toast.success(successMessage);
      router.refresh();
    });
  }

  if (status !== "confirmed" && status !== "in_progress") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "confirmed" && (
        <Button
          onClick={() => transition("in_progress", "Location démarrée.")}
          disabled={pending}
          className="gap-1.5"
        >
          <Play className="size-4" aria-hidden />
          Démarrer la location
        </Button>
      )}
      {status === "in_progress" && (
        <Button
          onClick={() => transition("completed", "Location terminée — matériel rendu.")}
          disabled={pending}
          className="gap-1.5"
        >
          <CheckCircle2 className="size-4" aria-hidden />
          Terminer la location
        </Button>
      )}

      <Button
        variant="outline"
        onClick={() => setCancelOpen(true)}
        disabled={pending}
        className="gap-1.5 text-destructive"
      >
        <Ban className="size-4" aria-hidden />
        Annuler
      </Button>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la réservation ?</DialogTitle>
            <DialogDescription>
              La réservation de {customerName} sera annulée et les unités de
              matériel redeviendront disponibles sur la période. Cette action
              est définitive.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={pending}
            >
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={() => transition("cancelled", "Réservation annulée.")}
              disabled={pending}
            >
              {pending ? "Annulation…" : "Confirmer l'annulation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
