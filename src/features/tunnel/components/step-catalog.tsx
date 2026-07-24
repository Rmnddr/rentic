"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { useTunnelStore } from "../store";
import type { AvailabilityMap, TunnelCatalog, TunnelPack } from "../types";
import { cn } from "@/lib/utils";

/** Vignette produit avec fallback icône quand l'image est absente. */
function ProductThumbnail({
  imageUrl,
  name,
  className,
}: {
  imageUrl: string | null;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-xl bg-muted",
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="64px"
          className="object-cover"
        />
      ) : (
        <span className="flex h-full items-center justify-center">
          <Package className="size-6 text-muted-foreground/40" aria-hidden />
        </span>
      )}
    </span>
  );
}

export function StepCatalog({
  catalog,
  availability,
  onBack,
  onNext,
}: {
  catalog: TunnelCatalog;
  availability: AvailabilityMap;
  onBack: () => void;
  onNext: () => void;
}) {
  const { items, addItem, removeItem, setQuantity } = useTunnelStore();

  const productById = useMemo(
    () => new Map(catalog.products.map((p) => [p.id, p])),
    [catalog.products],
  );

  const cartTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  function addProduct(productId: string) {
    const product = productById.get(productId);
    if (!product) return;
    addItem({
      productId: product.id,
      productName: product.name,
      packId: null,
      packName: null,
      quantity: 1,
      unitPrice: product.price_web,
      isOptional: false,
      categoryId: product.category_id,
    });
  }

  return (
    <section aria-labelledby="step-catalog-title">
      <h2 id="step-catalog-title" className="text-h2">
        Choisissez votre matériel
      </h2>

      {/* Produits par catégorie */}
      <div className="mt-6 space-y-8">
        {catalog.categories.map((cat) => {
          const products = catalog.products.filter((p) => p.category_id === cat.id);
          if (products.length === 0) return null;
          return (
            <div key={cat.id}>
              <h3 className="mb-4 text-xl font-bold text-foreground">
                {cat.name}
              </h3>
              <ul className="space-y-4">
                {products.map((product) => {
                  const available = availability[product.id] ?? 0;
                  const inCart = items
                    .filter((i) => i.productId === product.id)
                    .reduce((s, i) => s + i.quantity, 0);
                  const remaining = available - inCart;
                  return (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-surface p-4 shadow-organic"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <ProductThumbnail
                          imageUrl={product.image_url}
                          name={product.name}
                          className="size-16"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-lg font-bold tabular-nums text-primary">
                            {formatCurrency(product.price_web)}
                          </p>
                          <p className="text-caption text-muted-foreground">
                            {available > 0
                              ? `${available} disponible${available > 1 ? "s" : ""}`
                              : "Indisponible sur ces dates"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={remaining <= 0}
                        onClick={() => addProduct(product.id)}
                        aria-label={`Ajouter ${product.name} au panier`}
                      >
                        <Plus className="size-4" aria-hidden />
                        Ajouter
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {/* Packs */}
        {catalog.packs.length > 0 && (
          <div>
            <h3 className="mb-4 text-xl font-bold text-foreground">Packs</h3>
            <ul className="space-y-4">
              {catalog.packs.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  catalog={catalog}
                  availability={availability}
                />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Panier */}
      <div className="mt-10 rounded-2xl bg-surface p-5 shadow-organic">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <ShoppingCart className="size-5 text-primary" aria-hidden />
          Votre panier
        </h3>
        {items.length === 0 ? (
          <p className="mt-2 text-body-sm text-muted-foreground">
            Ajoutez du matériel pour continuer.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {items.map((item, index) => (
              <li
                key={`${item.productId}-${item.packId ?? "solo"}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <ProductThumbnail
                    imageUrl={productById.get(item.productId)?.image_url ?? null}
                    name={item.productName}
                    className="size-10"
                  />
                  <div className="min-w-0 flex-1">
                    {/* div et non p : Badge rend un <div>, invalide dans un <p> */}
                    <div className="flex items-center gap-2 text-body-sm font-medium">
                      <span className="truncate">{item.productName}</span>
                      {item.packName && (
                        <Badge variant="secondary">{item.packName}</Badge>
                      )}
                    </div>
                    <p className="text-caption text-muted-foreground">
                      {formatCurrency(item.unitPrice)} / unité
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => setQuantity(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label={`Réduire la quantité de ${item.productName}`}
                  >
                    <Minus className="size-3" aria-hidden />
                  </Button>
                  <span className="w-6 text-center text-body-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => setQuantity(index, item.quantity + 1)}
                    disabled={
                      item.quantity >= (availability[item.productId] ?? 0)
                    }
                    aria-label={`Augmenter la quantité de ${item.productName}`}
                  >
                    <Plus className="size-3" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    onClick={() => removeItem(index)}
                    aria-label={`Retirer ${item.productName} du panier`}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-muted pt-4">
            <span className="text-caption font-bold uppercase tracking-wider text-muted-foreground">
              Total indicatif
            </span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              {formatCurrency(cartTotal)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onNext} disabled={items.length === 0}>
          Continuer
        </Button>
      </div>
    </section>
  );
}

function PackCard({
  pack,
  catalog,
  availability,
}: {
  pack: TunnelPack;
  catalog: TunnelCatalog;
  availability: AvailabilityMap;
}) {
  const addItem = useTunnelStore((s) => s.addItem);
  const [selectedOptional, setSelectedOptional] = useState<Set<string>>(
    new Set(),
  );

  const productById = new Map(catalog.products.map((p) => [p.id, p]));

  const required = pack.items.filter((i) => i.is_required);
  const optional = pack.items.filter((i) => !i.is_required);

  const priceOf = (productId: string, override: number | null) =>
    override ?? productById.get(productId)?.price_web ?? 0;

  const packAvailable = required.every((i) => (availability[i.product_id] ?? 0) > 0);

  const packPrice =
    required.reduce((s, i) => s + priceOf(i.product_id, i.price_web_override), 0) +
    optional
      .filter((i) => selectedOptional.has(i.product_id))
      .reduce((s, i) => s + priceOf(i.product_id, i.price_web_override), 0);

  function toggleOptional(productId: string) {
    setSelectedOptional((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function addPack() {
    const toAdd = [
      ...required.map((i) => ({ packItem: i, isOptional: false })),
      ...optional
        .filter((i) => selectedOptional.has(i.product_id))
        .map((i) => ({ packItem: i, isOptional: true })),
    ];
    for (const { packItem, isOptional } of toAdd) {
      const product = productById.get(packItem.product_id);
      if (!product) continue;
      addItem({
        productId: product.id,
        productName: product.name,
        packId: pack.id,
        packName: pack.name,
        quantity: 1,
        unitPrice: priceOf(product.id, packItem.price_web_override),
        isOptional,
        categoryId: product.category_id,
      });
    }
  }

  return (
    <li className="rounded-2xl bg-surface p-5 shadow-organic">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Badge className="bg-accent text-accent-foreground uppercase tracking-wider">
            Pack
          </Badge>
          <p className="mt-2 text-lg font-bold text-foreground">{pack.name}</p>
          {pack.description && (
            <p className="text-body-sm text-muted-foreground">{pack.description}</p>
          )}
          <p className="mt-2 text-body-sm text-muted-foreground">
            Inclus :{" "}
            {required
              .map((i) => productById.get(i.product_id)?.name ?? "Produit")
              .join(", ")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="text-xl font-bold tabular-nums text-primary">
            {formatCurrency(packPrice)}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={addPack}
            disabled={!packAvailable}
            aria-label={`Ajouter le pack ${pack.name} au panier`}
          >
            <Plus className="size-4" aria-hidden />
            Ajouter le pack
          </Button>
          {!packAvailable && (
            <p className="text-caption text-muted-foreground">
              Indisponible sur ces dates
            </p>
          )}
        </div>
      </div>

      {optional.length > 0 && (
        <div className="mt-4 rounded-xl bg-muted/50 p-4">
          <p className="mb-3 text-caption font-bold uppercase tracking-wider text-muted-foreground">
            Options recommandées
          </p>
          <ul className="space-y-3">
            {optional.map((i) => {
              const product = productById.get(i.product_id);
              if (!product) return null;
              const id = `pack-${pack.id}-opt-${i.product_id}`;
              const disabled = (availability[i.product_id] ?? 0) <= 0;
              return (
                <li key={i.product_id} className="flex items-center gap-3">
                  <Checkbox
                    id={id}
                    checked={selectedOptional.has(i.product_id)}
                    onCheckedChange={() => toggleOptional(i.product_id)}
                    disabled={disabled}
                  />
                  <label
                    htmlFor={id}
                    className="flex flex-1 items-center justify-between gap-2 text-body-sm font-medium text-foreground"
                  >
                    <span>{product.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      +{formatCurrency(priceOf(i.product_id, i.price_web_override))}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
