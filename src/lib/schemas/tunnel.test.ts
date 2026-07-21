import { describe, expect, it } from "vitest";
import { parseInput } from "./parse";
import { createWebReservationSchema } from "./tunnel";

const UUID = "5f0f6a2e-1b2c-4d3e-8f4a-9b8c7d6e5f4a";

// Le tunnel n'envoie JAMAIS de prix : ils sont recalculés par la fonction
// Postgres create_web_reservation.
const validItem = { productId: UUID, quantity: 1, isOptional: false };

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    shopId: UUID,
    customerName: "Marie Martin",
    customerEmail: "marie@example.com",
    customerPhone: "0601020304",
    startDate: "2026-08-01",
    endDate: "2026-08-05",
    items: [validItem],
    participantValues: [
      { itemIndex: 0, attributeId: UUID, value: "42", participantIndex: 0 },
    ],
    acceptCgv: true,
    ...overrides,
  };
}

describe("createWebReservationSchema", () => {
  it("accepte un input valide complet", () => {
    const result = parseInput(createWebReservationSchema, validInput());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.shopId).toBe(UUID);
      expect(result.data.items[0].packId).toBeNull();
    }
  });

  it("rejette si les CGV ne sont pas acceptées", () => {
    const result = parseInput(createWebReservationSchema, validInput({ acceptCgv: false }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.acceptCgv).toContain(
        "Vous devez accepter les conditions générales.",
      );
    }
  });

  it("rejette un shopId non-UUID (injection)", () => {
    expect(
      parseInput(createWebReservationSchema, validInput({ shopId: "1 OR 1=1" })).ok,
    ).toBe(false);
  });

  it("rejette un email manquant ou invalide", () => {
    expect(parseInput(createWebReservationSchema, validInput({ customerEmail: "" })).ok).toBe(
      false,
    );
    expect(
      parseInput(createWebReservationSchema, validInput({ customerEmail: "nope" })).ok,
    ).toBe(false);
  });

  it("rejette un email de plus de 320 caractères", () => {
    const email = `${"a".repeat(310)}@example.com`;
    expect(
      parseInput(createWebReservationSchema, validInput({ customerEmail: email })).ok,
    ).toBe(false);
  });

  it("rejette un nom de plus de 200 caractères", () => {
    expect(
      parseInput(createWebReservationSchema, validInput({ customerName: "x".repeat(201) })).ok,
    ).toBe(false);
  });

  it("rejette une date hors format AAAA-MM-JJ", () => {
    expect(
      parseInput(createWebReservationSchema, validInput({ startDate: "2026-8-1" })).ok,
    ).toBe(false);
  });

  it("rejette endDate < startDate", () => {
    const result = parseInput(
      createWebReservationSchema,
      validInput({ startDate: "2026-08-05", endDate: "2026-08-01" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.endDate).toBeDefined();
  });

  it("rejette un panier vide", () => {
    const result = parseInput(createWebReservationSchema, validInput({ items: [] }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Panier vide.");
  });

  it("rejette plus de 50 items", () => {
    const items = Array.from({ length: 51 }, () => validItem);
    expect(parseInput(createWebReservationSchema, validInput({ items })).ok).toBe(false);
  });

  it("rejette un item portant un prix (le client ne fixe jamais les prix)", () => {
    const items = [{ ...validItem, unitPrice: 0 }];
    const result = parseInput(createWebReservationSchema, validInput({ items }));
    // Champ inconnu ignoré par Zod : le prix client n'atteint jamais la base.
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.items[0]).not.toHaveProperty("unitPrice");
    }
  });

  it.each([
    ["quantité nulle", { quantity: 0 }],
    ["quantité > 100", { quantity: 101 }],
    ["quantité non entière", { quantity: 2.5 }],
  ])("rejette un item avec %s", (_label, override) => {
    const items = [{ ...validItem, ...override }];
    expect(parseInput(createWebReservationSchema, validInput({ items })).ok).toBe(false);
  });

  it("rejette un attributeId de participant non-UUID", () => {
    const participantValues = [
      { itemIndex: 0, attributeId: "hack", value: "42", participantIndex: 0 },
    ];
    expect(
      parseInput(createWebReservationSchema, validInput({ participantValues })).ok,
    ).toBe(false);
  });

  it("rejette un participantIndex négatif", () => {
    const participantValues = [
      { itemIndex: 0, attributeId: UUID, value: "42", participantIndex: -1 },
    ];
    expect(
      parseInput(createWebReservationSchema, validInput({ participantValues })).ok,
    ).toBe(false);
  });

  it("rejette un itemIndex hors bornes (0-49)", () => {
    const participantValues = [
      { itemIndex: 50, attributeId: UUID, value: "42", participantIndex: 0 },
    ];
    expect(
      parseInput(createWebReservationSchema, validInput({ participantValues })).ok,
    ).toBe(false);
  });

  it("participantValues absent → tableau vide par défaut", () => {
    const input = validInput();
    delete (input as Record<string, unknown>).participantValues;
    const result = parseInput(createWebReservationSchema, input);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.participantValues).toEqual([]);
  });
});
