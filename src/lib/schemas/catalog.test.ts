import { describe, expect, it } from "vitest";
import { parseFormData, parseInput } from "./parse";
import {
  createAttributeSchema,
  createCategorySchema,
  createProductSchema,
  deleteByIdSchema,
  updateUnitSchema,
} from "./catalog";

const UUID = "5f0f6a2e-1b2c-4d3e-8f4a-9b8c7d6e5f4a";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("createCategorySchema", () => {
  it("accepte un nom valide et applique le type par défaut", () => {
    const result = parseFormData(createCategorySchema, fd({ name: "Skis" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ name: "Skis", type: "product" });
  });

  it("rejette un nom vide avec une fieldError", () => {
    const result = parseFormData(createCategorySchema, fd({ name: "  " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.name).toBeDefined();
  });

  it("rejette un nom de plus de 200 caractères", () => {
    const result = parseFormData(createCategorySchema, fd({ name: "x".repeat(201) }));
    expect(result.ok).toBe(false);
  });

  it("retombe sur 'product' si le type est inconnu", () => {
    const result = parseFormData(
      createCategorySchema,
      fd({ name: "Skis", type: "hacker" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.type).toBe("product");
  });
});

describe("deleteByIdSchema", () => {
  it("rejette un id non-UUID (injection)", () => {
    const result = parseInput(deleteByIdSchema, { id: "1 OR 1=1" });
    expect(result.ok).toBe(false);
  });

  it("accepte un UUID", () => {
    expect(parseInput(deleteByIdSchema, { id: UUID }).ok).toBe(true);
  });
});

describe("createProductSchema", () => {
  it("coerce les prix string → number entier", () => {
    const result = parseFormData(
      createProductSchema,
      fd({ name: "Ski alpin", categoryId: UUID, priceWeb: "1500", priceShop: "1200" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.priceWeb).toBe(1500);
      expect(result.data.priceShop).toBe(1200);
    }
  });

  it("rejette un prix négatif", () => {
    const result = parseFormData(
      createProductSchema,
      fd({ name: "Ski", categoryId: UUID, priceWeb: "-5" }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejette un prix non numérique", () => {
    const result = parseFormData(
      createProductSchema,
      fd({ name: "Ski", categoryId: UUID, priceWeb: "abc" }),
    );
    expect(result.ok).toBe(false);
  });

  it("accepte un brandId vide (optionnel)", () => {
    const result = parseFormData(
      createProductSchema,
      fd({ name: "Ski", categoryId: UUID, brandId: "" }),
    );
    expect(result.ok).toBe(true);
  });
});

describe("createAttributeSchema", () => {
  it("transforme required 'true' en booléen", () => {
    const result = parseFormData(
      createAttributeSchema,
      fd({ categoryId: UUID, name: "Pointure", required: "true" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.required).toBe(true);
  });

  it("required absent → false", () => {
    const result = parseFormData(
      createAttributeSchema,
      fd({ categoryId: UUID, name: "Pointure" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.required).toBe(false);
  });
});

describe("updateUnitSchema", () => {
  it("rejette un statut hors enum DB", () => {
    const result = parseInput(updateUnitSchema, {
      id: UUID,
      label: "SKI-001",
      status: "stolen",
    });
    expect(result.ok).toBe(false);
  });
});
