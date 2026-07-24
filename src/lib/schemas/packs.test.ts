import { afterEach, describe, expect, it, vi } from "vitest";
import { parseFormData } from "./parse";
import { createPackSchema, updatePackSchema } from "./packs";

const UUID_A = "5f0f6a2e-1b2c-4d3e-8f4a-9b8c7d6e5f4a";
const UUID_B = "7a1b2c3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d";
const SUPABASE_URL = "https://abcdefgh.supabase.co";
const IMAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/shop-media/shop-1/packs/cover.webp`;

type ItemInput = {
  productId: string;
  isRequired?: boolean;
  priceWebOverride?: number | null;
  priceShopOverride?: number | null;
  position?: number;
};

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

/** Deux items valides, dont le premier obligatoire — le minimum accepté. */
function validItems(overrides: Partial<ItemInput>[] = []): ItemInput[] {
  const base: ItemInput[] = [
    { productId: UUID_A, isRequired: true, position: 0 },
    { productId: UUID_B, isRequired: false, position: 1 },
  ];
  return base.map((item, i) => ({ ...item, ...overrides[i] }));
}

function packForm(items: ItemInput[], extra: Record<string, string> = {}) {
  return fd({ name: "Pack ski", items: JSON.stringify(items), ...extra });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createPackSchema", () => {
  it("accepte un pack minimal et applique les valeurs par défaut", () => {
    const result = parseFormData(createPackSchema, packForm(validItems()));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Pack ski");
      expect(result.data.description).toBe("");
      expect(result.data.imageUrl).toBe("");
      expect(result.data.items).toHaveLength(2);
      expect(result.data.items[0].priceWebOverride).toBeNull();
      expect(result.data.items[0].priceShopOverride).toBeNull();
    }
  });

  it("rejette un nom vide", () => {
    const result = parseFormData(
      createPackSchema,
      packForm(validItems(), { name: "   " }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.name).toBeDefined();
  });

  it("rejette un JSON d'items malformé", () => {
    const result = parseFormData(
      createPackSchema,
      fd({ name: "Pack ski", items: "{pas du json" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Format des items invalide.");
  });

  it("rejette un pack d'un seul produit", () => {
    const result = parseFormData(
      createPackSchema,
      packForm([{ productId: UUID_A, isRequired: true, position: 0 }]),
    );
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error).toBe("Un pack doit contenir au moins 2 produits.");
  });

  it("rejette un pack sans aucun produit obligatoire", () => {
    const result = parseFormData(
      createPackSchema,
      packForm(validItems([{ isRequired: false }])),
    );
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.error).toBe(
        "Un pack doit contenir au moins un produit obligatoire.",
      );
  });

  it("rejette un productId non-UUID (injection)", () => {
    const result = parseFormData(
      createPackSchema,
      packForm(validItems([{ productId: "1 OR 1=1" }])),
    );
    expect(result.ok).toBe(false);
  });

  it("rejette un override de prix non entier (euros au lieu de centimes)", () => {
    const result = parseFormData(
      createPackSchema,
      packForm(validItems([{ priceWebOverride: 19.9 }])),
    );
    expect(result.ok).toBe(false);
  });

  it("rejette un override de prix négatif", () => {
    const result = parseFormData(
      createPackSchema,
      packForm(validItems([{ priceShopOverride: -100 }])),
    );
    expect(result.ok).toBe(false);
  });

  it("accepte des overrides entiers en centimes", () => {
    const result = parseFormData(
      createPackSchema,
      packForm(validItems([{ priceWebOverride: 4500, priceShopOverride: 4000 }])),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items[0].priceWebOverride).toBe(4500);
      expect(result.data.items[0].priceShopOverride).toBe(4000);
    }
  });

  it("accepte une image du bucket shop-media", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
    const result = parseFormData(
      createPackSchema,
      packForm(validItems(), { imageUrl: IMAGE_URL }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.imageUrl).toBe(IMAGE_URL);
  });

  it("rejette une image d'origine tierce", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
    const result = parseFormData(
      createPackSchema,
      packForm(validItems(), { imageUrl: "https://evil.example.com/x.jpg" }),
    );
    expect(result.ok).toBe(false);
  });
});

describe("updatePackSchema", () => {
  it("exige un id UUID", () => {
    const sansId = parseFormData(updatePackSchema, packForm(validItems()));
    expect(sansId.ok).toBe(false);

    const avecId = parseFormData(
      updatePackSchema,
      packForm(validItems(), { id: UUID_A }),
    );
    expect(avecId.ok).toBe(true);
  });
});
