"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createFirstCategoryAction,
  updateProfileAction,
  updateShopAction,
} from "@/features/onboarding/actions";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  currentStep: number;
  profile: { firstName: string; lastName: string };
  shop: {
    name: string;
    address: string;
    siret: string;
    tvaNumber: string;
    phone: string;
  };
};

export function OnboardingWizard({ currentStep, profile, shop }: Props) {
  const [step, setStep] = useState(currentStep);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfileAction(formData);
    if (result.success) setStep(2);
    else setError(result.error);
    setIsLoading(false);
  }

  async function handleShopSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateShopAction(formData);
    if (result.success) setStep(3);
    else setError(result.error);
    setIsLoading(false);
  }

  async function handleCategorySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await createFirstCategoryAction(formData);
    // redirect happens server-side
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-h1">Bienvenue sur Rentic</CardTitle>
        <CardDescription>
          Configurons votre magasin en 3 étapes
        </CardDescription>

        {/* Progress */}
        <div className="mt-4 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 w-16 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-caption text-muted-foreground">
          Étape {step}/3
        </p>
      </CardHeader>

      <CardContent>
        {error && (
          <p className="mb-4 text-sm text-destructive">{error}</p>
        )}

        {step === 1 && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h3 className="text-h3">Votre profil</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={profile.firstName}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={profile.lastName}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={shop.phone}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Continuer"}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleShopSubmit} className="space-y-4">
            <h3 className="text-h3">Votre magasin</h3>
            <div className="space-y-2">
              <Label htmlFor="shopName">Nom du magasin</Label>
              <Input
                id="shopName"
                name="shopName"
                defaultValue={shop.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                defaultValue={shop.address}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input
                  id="siret"
                  name="siret"
                  defaultValue={shop.siret}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tvaNumber">N° TVA</Label>
                <Input
                  id="tvaNumber"
                  name="tvaNumber"
                  defaultValue={shop.tvaNumber}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Retour
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Continuer"}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <h3 className="text-h3">Première catégorie</h3>
            <p className="text-body-sm text-muted-foreground">
              Créez votre première catégorie de produits pour commencer
            </p>
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nom de la catégorie</Label>
              <Input
                id="categoryName"
                name="categoryName"
                placeholder="Ex: Skis, Snowboards, VTT..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryType">Type</Label>
              <select
                id="categoryType"
                name="categoryType"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                defaultValue="product"
              >
                <option value="product">Produit</option>
                <option value="participant">Participant</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Retour
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Création..." : "Terminer"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
