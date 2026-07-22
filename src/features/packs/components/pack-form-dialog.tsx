"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ImageUpload } from "@/components/shared/image-upload";
import { createPackAction, updatePackAction } from "@/features/packs/actions";
import { formatCurrency } from "@/lib/utils/format-currency";

export type PackProduct = {
  id: string;
  name: string;
  priceWeb: number;
  priceShop: number;
};

export type PackDraft = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  items: {
    productId: string;
    isRequired: boolean;
    priceWebOverride: number | null;
    priceShopOverride: number | null;
  }[];
};

/** Les overrides sont saisis en euros ; la conversion en centimes se fait à la soumission. */
type DraftItem = {
  productId: string;
  isRequired: boolean;
  priceWebOverrideEur: string;
  priceShopOverrideEur: string;
};

function centsToEurInput(cents: number | null): string {
  return cents === null ? "" : (cents / 100).toFixed(2);
}

function eurInputToCents(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isNaN(parsed) ? null : Math.round(parsed * 100);
}

function toDraftItems(pack: PackDraft | undefined): DraftItem[] {
  if (!pack) return [];
  return pack.items.map((item) => ({
    productId: item.productId,
    isRequired: item.isRequired,
    priceWebOverrideEur: centsToEurInput(item.priceWebOverride),
    priceShopOverrideEur: centsToEurInput(item.priceShopOverride),
  }));
}

export function PackFormDialog({
  products,
  pack,
}: {
  products: PackProduct[];
  /** Absent : création. Présent : édition du pack existant. */
  pack?: PackDraft;
}) {
  const isEdit = pack !== undefined;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<DraftItem[]>(() => toDraftItems(pack));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const productsById = new Map(products.map((p) => [p.id, p]));
  const available = products.filter(
    (p) => !items.some((item) => item.productId === p.id),
  );

  function reset() {
    setItems(toDraftItems(pack));
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    // Rouvrir le dialog doit repartir de l'état persisté, pas d'une saisie abandonnée.
    if (!next) reset();
  }

  function addItem(productId: string) {
    if (!productId) return;
    // La composition change : l'erreur serveur précédente ne décrit plus l'état.
    setError(null);
    setItems((current) => [
      ...current,
      {
        productId,
        // Le premier produit ajouté est obligatoire : un pack en exige au moins un.
        isRequired: current.length === 0,
        priceWebOverrideEur: "",
        priceShopOverrideEur: "",
      },
    ]);
  }

  function updateItem(productId: string, patch: Partial<DraftItem>) {
    setError(null);
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, ...patch } : item,
      ),
    );
  }

  function removeItem(productId: string) {
    setError(null);
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set(
      "items",
      JSON.stringify(
        items.map((item, index) => ({
          productId: item.productId,
          isRequired: item.isRequired,
          priceWebOverride: eurInputToCents(item.priceWebOverrideEur),
          priceShopOverride: eurInputToCents(item.priceShopOverrideEur),
          position: index,
        })),
      ),
    );

    const result = isEdit
      ? await updatePackAction(formData)
      : await createPackAction(formData);

    if (result.success) {
      setOpen(false);
      if (!isEdit) setItems([]);
      router.refresh();
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="size-3.5" aria-hidden />
            Modifier
          </Button>
        ) : (
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            Pack
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le pack" : "Nouveau pack"}</DialogTitle>
          <DialogDescription>
            Un pack regroupe au moins 2 produits, dont au moins un obligatoire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={pack.id} />}

          <div className="space-y-2">
            <Label htmlFor="pack-name">Nom</Label>
            <Input
              id="pack-name"
              name="name"
              required
              defaultValue={pack?.name ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pack-desc">Description</Label>
            <Input
              id="pack-desc"
              name="description"
              defaultValue={pack?.description ?? ""}
            />
          </div>

          <ImageUpload
            folder="packs"
            name="imageUrl"
            label="Image du pack"
            defaultValue={pack?.imageUrl}
          />

          <div className="space-y-2">
            <Label htmlFor="pack-add-product">Produits du pack</Label>
            <select
              id="pack-add-product"
              value=""
              disabled={available.length === 0}
              onChange={(e) => {
                addItem(e.target.value);
                e.target.value = "";
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm disabled:opacity-50"
            >
              <option value="">
                {available.length === 0
                  ? "Tous les produits sont déjà dans le pack"
                  : "Ajouter un produit…"}
              </option>
              {available.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            {items.length === 0 ? (
              <p className="rounded-md border border-dashed py-6 text-center text-body-sm text-muted-foreground">
                Aucun produit sélectionné
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => {
                  const product = productsById.get(item.productId);
                  if (!product) return null;

                  return (
                    <li
                      key={item.productId}
                      className="space-y-2 rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="text-caption text-muted-foreground tabular-nums">
                            Web {formatCurrency(product.priceWeb)} · Magasin{" "}
                            {formatCurrency(product.priceShop)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-destructive"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Retirer ${product.name} du pack`}
                        >
                          <X className="size-4" aria-hidden />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`req-${item.productId}`}
                          checked={item.isRequired}
                          onCheckedChange={(checked) =>
                            updateItem(item.productId, {
                              isRequired: checked === true,
                            })
                          }
                        />
                        <Label
                          htmlFor={`req-${item.productId}`}
                          className="text-body-sm font-normal"
                        >
                          Obligatoire
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`web-${item.productId}`}
                            className="text-caption text-muted-foreground"
                          >
                            Prix web (€)
                          </Label>
                          <Input
                            id={`web-${item.productId}`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={(product.priceWeb / 100).toFixed(2)}
                            value={item.priceWebOverrideEur}
                            onChange={(e) =>
                              updateItem(item.productId, {
                                priceWebOverrideEur: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`shop-${item.productId}`}
                            className="text-caption text-muted-foreground"
                          >
                            Prix magasin (€)
                          </Label>
                          <Input
                            id={`shop-${item.productId}`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={(product.priceShop / 100).toFixed(2)}
                            value={item.priceShopOverrideEur}
                            onChange={(e) =>
                              updateItem(item.productId, {
                                priceShopOverrideEur: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="text-caption text-muted-foreground">
              Laissez un prix vide pour conserver le tarif du produit.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-body-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? "Enregistrement…"
              : isEdit
                ? "Enregistrer"
                : "Créer le pack"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
