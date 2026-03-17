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
import { createProductAction } from "@/features/catalog/actions";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
};

export function CreateProductDialog({ categories, brands }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    // Convert prices to cents
    const priceWeb = Math.round(parseFloat(formData.get("priceWebEur") as string || "0") * 100);
    const priceShop = Math.round(parseFloat(formData.get("priceShopEur") as string || "0") * 100);
    formData.set("priceWeb", priceWeb.toString());
    formData.set("priceShop", priceShop.toString());

    const result = await createProductAction(formData);
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
          Produit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau produit</DialogTitle>
          <DialogDescription>
            Ajoutez un produit à votre catalogue
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prod-name">Nom</Label>
            <Input id="prod-name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-cat">Catégorie</Label>
            <select
              id="prod-cat"
              name="categoryId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Sélectionner...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-brand">Marque (optionnel)</Label>
            <select
              id="prod-brand"
              name="brandId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Aucune</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-desc">Description</Label>
            <Input id="prod-desc" name="description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prod-price-web">Prix web (€)</Label>
              <Input
                id="prod-price-web"
                name="priceWebEur"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-price-shop">Prix magasin (€)</Label>
              <Input
                id="prod-price-shop"
                name="priceShopEur"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création..." : "Créer le produit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
