import { describe, expect, it } from "vitest";
import { parseFormData, parseInput } from "./parse";
import {
  createReservationSchema,
  reservationItemSchema,
  updateReservationStatusSchema,
} from "./reservations";

const UUID = "5f0f6a2e-1b2c-4d3e-8f4a-9b8c7d6e5f4a";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

const validItem = { productId: UUID, quantity: 2, unitPrice: 1500, isOptional: false };

function reservationFd(overrides: Record<string, string> = {}): FormData {
  return fd({
    customerName: "Jean Dupont",
    customerEmail: "jean@example.com",
    customerPhone: "0601020304",
    startDate: "2026-08-01",
    endDate: "2026-08-05",
    items: JSON.stringify([validItem]),
    ...overrides,
  });
}

describe("createReservationSchema", () => {
  it("accepte une réservation valide (items JSON parsés)", () => {
    const result = parseFormData(createReservationSchema, reservationFd());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.items[0]).toEqual({ ...validItem, packId: null });
      expect(result.data.source).toBe("back-office");
    }
  });

  it("rejette un nom de client vide avec une fieldError", () => {
    const result = parseFormData(createReservationSchema, reservationFd({ customerName: "  " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.customerName).toBeDefined();
  });

  it("accepte un email vide (optionnel) mais rejette un email invalide", () => {
    expect(
      parseFormData(createReservationSchema, reservationFd({ customerEmail: "" })).ok,
    ).toBe(true);
    expect(
      parseFormData(createReservationSchema, reservationFd({ customerEmail: "pas-un-email" })).ok,
    ).toBe(false);
  });

  it("rejette une date hors format AAAA-MM-JJ", () => {
    const result = parseFormData(
      createReservationSchema,
      reservationFd({ startDate: "01/08/2026" }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejette endDate < startDate", () => {
    const result = parseFormData(
      createReservationSchema,
      reservationFd({ startDate: "2026-08-05", endDate: "2026-08-01" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.endDate).toBeDefined();
  });

  it("accepte endDate = startDate (location à la journée)", () => {
    const result = parseFormData(
      createReservationSchema,
      reservationFd({ startDate: "2026-08-01", endDate: "2026-08-01" }),
    );
    expect(result.ok).toBe(true);
  });

  it("rejette un JSON d'items malformé", () => {
    const result = parseFormData(createReservationSchema, reservationFd({ items: "{oops" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Format des items invalide.");
  });

  it("rejette un tableau d'items vide", () => {
    const result = parseFormData(createReservationSchema, reservationFd({ items: "[]" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Au moins un produit requis.");
  });

  it("rejette plus de 50 items", () => {
    const items = JSON.stringify(Array.from({ length: 51 }, () => validItem));
    const result = parseFormData(createReservationSchema, reservationFd({ items }));
    expect(result.ok).toBe(false);
  });

  it("rejette un productId non-UUID dans les items (injection)", () => {
    const items = JSON.stringify([{ ...validItem, productId: "1 OR 1=1" }]);
    const result = parseFormData(createReservationSchema, reservationFd({ items }));
    expect(result.ok).toBe(false);
  });

  it("retombe sur 'back-office' si la source est inconnue", () => {
    const result = parseFormData(createReservationSchema, reservationFd({ source: "hacker" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.source).toBe("back-office");
  });

  it("accepte la source 'web'", () => {
    const result = parseFormData(createReservationSchema, reservationFd({ source: "web" }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.source).toBe("web");
  });
});

describe("reservationItemSchema — bornes", () => {
  it.each([
    ["quantité nulle", { quantity: 0 }],
    ["quantité négative", { quantity: -1 }],
    ["quantité non entière", { quantity: 1.5 }],
    ["quantité > 100", { quantity: 101 }],
    ["prix négatif", { unitPrice: -1 }],
    ["prix non entier", { unitPrice: 10.5 }],
    ["prix trop élevé", { unitPrice: 1_000_000_01 }],
  ])("rejette %s", (_label, override) => {
    const result = parseInput(reservationItemSchema, { ...validItem, ...override });
    expect(result.ok).toBe(false);
  });

  it("applique les défauts packId=null et isOptional=false", () => {
    const result = parseInput(reservationItemSchema, {
      productId: UUID,
      quantity: 1,
      unitPrice: 0,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.packId).toBeNull();
      expect(result.data.isOptional).toBe(false);
    }
  });
});

describe("updateReservationStatusSchema", () => {
  it("accepte un statut de l'enum DB", () => {
    expect(parseInput(updateReservationStatusSchema, { id: UUID, status: "cancelled" }).ok).toBe(
      true,
    );
  });

  it("rejette un statut hors enum DB", () => {
    const result = parseInput(updateReservationStatusSchema, { id: UUID, status: "paused" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.status).toBeDefined();
  });

  it("rejette un id non-UUID", () => {
    expect(
      parseInput(updateReservationStatusSchema, { id: "abc", status: "cancelled" }).ok,
    ).toBe(false);
  });
});
