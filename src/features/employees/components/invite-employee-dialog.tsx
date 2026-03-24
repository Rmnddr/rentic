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
import { inviteEmployeeAction } from "@/features/employees/actions";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InviteEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await inviteEmployeeAction(formData);
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
          <UserPlus className="h-4 w-4" />
          Inviter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un employé</DialogTitle>
          <DialogDescription>
            Un email d&apos;invitation sera envoyé
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inv-email">Email</Label>
            <Input id="inv-email" name="email" type="email" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-first">Prénom</Label>
              <Input id="inv-first" name="firstName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-last">Nom</Label>
              <Input id="inv-last" name="lastName" />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Envoi..." : "Envoyer l'invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
