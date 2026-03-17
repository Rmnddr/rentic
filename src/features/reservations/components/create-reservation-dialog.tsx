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
import { createReservationAction } from "@/features/reservations/actions";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateReservationDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    // For now, create a simple reservation without items
    // Items will be added in a more complete flow later
    formData.set("items", JSON.stringify([]));
    formData.set("source", "back-office");

    const result = await createReservationAction(formData);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Réservation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle réservation</DialogTitle>
          <DialogDescription>
            Créez une réservation manuelle depuis le back-office
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="res-name">Nom du client</Label>
            <Input id="res-name" name="customerName" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="res-email">Email</Label>
              <Input id="res-email" name="customerEmail" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="res-phone">Téléphone</Label>
              <Input id="res-phone" name="customerPhone" type="tel" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="res-start">Date début</Label>
              <Input id="res-start" name="startDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="res-end">Date fin</Label>
              <Input id="res-end" name="endDate" type="date" required />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer la réservation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
