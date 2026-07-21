import { describe, expect, it } from "vitest";
import { parseFormData, parseInput } from "./parse";
import {
  createFirstCategorySchema,
  updateProfileSchema,
  updateShopSchema,
} from "./onboarding";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("updateProfileSchema", () => {
  it("accepte prénom + nom valides, phone absent → chaîne vide", () => {
    const result = parseFormData(
      updateProfileSchema,
      fd({ firstName: "Romain", lastName: "Didier" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        firstName: "Romain",
        lastName: "Didier",
        phone: "",
      });
    }
  });

  it("rejette un prénom vide avec une fieldError", () => {
    const result = parseFormData(
      updateProfileSchema,
      fd({ firstName: "  ", lastName: "Didier" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.firstName).toBeDefined();
  });

  it("rejette un nom manquant", () => {
    const result = parseFormData(updateProfileSchema, fd({ firstName: "Romain" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.lastName).toBeDefined();
  });
});

describe("updateShopSchema", () => {
  it("accepte un magasin valide avec slug", () => {
    const result = parseFormData(
      updateShopSchema,
      fd({ shopName: "Ski Shop 74", slug: "ski-shop-74" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.shopName).toBe("Ski Shop 74");
      expect(result.data.slug).toBe("ski-shop-74");
      expect(result.data.address).toBe("");
    }
  });

  it("rejette un nom de magasin vide", () => {
    const result = parseFormData(updateShopSchema, fd({ shopName: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.shopName).toBeDefined();
  });

  it("rejette un slug avec majuscules ou caractères spéciaux", () => {
    for (const slug of ["Ski-Shop", "ski shop", "ski_shop", "ski/../shop"]) {
      const result = parseFormData(updateShopSchema, fd({ shopName: "Ski Shop", slug }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.fieldErrors.slug).toBeDefined();
    }
  });

  it("rejette un slug trop court (1 caractère)", () => {
    const result = parseFormData(updateShopSchema, fd({ shopName: "Ski Shop", slug: "a" }));
    expect(result.ok).toBe(false);
  });

  it("rejette un slug de plus de 60 caractères", () => {
    const result = parseFormData(
      updateShopSchema,
      fd({ shopName: "Ski Shop", slug: "a".repeat(61) }),
    );
    expect(result.ok).toBe(false);
  });

  it("accepte un slug vide (non fourni par le formulaire)", () => {
    const result = parseFormData(updateShopSchema, fd({ shopName: "Ski Shop", slug: "" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.slug).toBe("");
  });

  it("slug absent → optionnel, parsing valide", () => {
    const result = parseInput(updateShopSchema, { shopName: "Ski Shop" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.slug).toBeUndefined();
  });
});

describe("createFirstCategorySchema", () => {
  it("accepte un nom valide et applique le type par défaut", () => {
    const result = parseFormData(
      createFirstCategorySchema,
      fd({ categoryName: "Skis" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ categoryName: "Skis", categoryType: "product" });
    }
  });

  it("rejette un nom de catégorie vide", () => {
    const result = parseFormData(createFirstCategorySchema, fd({ categoryName: " " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.categoryName).toBeDefined();
  });

  it("retombe sur 'product' si le type est inconnu", () => {
    const result = parseFormData(
      createFirstCategorySchema,
      fd({ categoryName: "Skis", categoryType: "hacker" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.categoryType).toBe("product");
  });
});
