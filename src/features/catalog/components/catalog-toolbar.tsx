"use client";

import { CreateBrandDialog } from "./create-brand-dialog";
import { CreateCategoryDialog } from "./create-category-dialog";
import { CreateProductDialog } from "./create-product-dialog";

type Props = {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
};

export function CatalogToolbar({ categories, brands }: Props) {
  return (
    <div className="flex gap-2">
      <CreateCategoryDialog />
      {categories.length > 0 && (
        <CreateProductDialog categories={categories} brands={brands} />
      )}
      <CreateBrandDialog />
    </div>
  );
}
