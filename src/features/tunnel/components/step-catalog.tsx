"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format-currency";
import { useTunnelStore } from "../store";
import type { AvailabilityMap, TunnelCatalog, TunnelPack } from "../types";

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
              <h3 className="mb-3 text-h3">{cat.name}</h3>
              <ul className="space-y-2">
                {products.map((product) => {
                  const available = availability[product.id] ?? 0;
                  const inCart = items
                    .filter((i) => i.productId === product.id)
                    .reduce((s, i) => s + i.quantity, 0);
                  const remaining = available - inCart;
                  return (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-body-sm text-muted-foreground">
                          {formatCurrency(product.price_web)} ·{" "}
                          {available > 0
                            ? `${available} disponible${available > 1 ? "s" : ""}`
                            : "Indisponible sur ces dates"}
                        </p>
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
            <h3 className="mb-3 text-h3">Packs</h3>
            <ul className="space-y-3">
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
      <div className="mt-8 rounded-lg border bg-card p-4">
        <h3 className="flex items-center gap-2 text-h3">
          <ShoppingCart className="size-5" aria-hidden />
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium">
                    {item.productName}
                    {item.packName && (
                      <Badge variant="secondary" className="ml-2">
                        {item.packName}
                      </Badge>
                    )}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {formatCurrency(item.unitPrice)} / unité
                  </p>
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
          <p className="mt-4 border-t pt-3 text-right font-semibold tabular-nums">
            Total indicatif : {formatCurrency(cartTotal)}
          </p>
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
    <li className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="secondary">Pack</Badge>
          <p className="mt-1 font-medium">{pack.name}</p>
          {pack.description && (
            <p className="text-body-sm text-muted-foreground">{pack.description}</p>
          )}
          <ul className="mt-2 space-y-1 text-body-sm text-muted-foreground">
            {required.map((i) => (
              <li key={i.product_id}>
                • {productById.get(i.product_id)?.name ?? "Produit"}{" "}
                <span className="tabular-nums">
                  ({formatCurrency(priceOf(i.product_id, i.price_web_override))})
                </span>
              </li>
            ))}
            {optional.map((i) => {
              const product = productById.get(i.product_id);
              if (!product) return null;
              const id = `pack-${pack.id}-opt-${i.product_id}`;
              return (
                <li key={i.product_id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={selectedOptional.has(i.product_id)}
                    onCheckedChange={() => toggleOptional(i.product_id)}
                    disabled={(availability[i.product_id] ?? 0) <= 0}
                  />
                  <label htmlFor={id}>
                    {product.name} (option,{" "}
                    <span className="tabular-nums">
                      {formatCurrency(priceOf(i.product_id, i.price_web_override))}
                    </span>
                    )
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="font-semibold tabular-nums">{formatCurrency(packPrice)}</p>
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
    </li>
  );
}
