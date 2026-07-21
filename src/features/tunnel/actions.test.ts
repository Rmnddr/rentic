import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWebReservationAction } from "./actions";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

const SHOP_ID = "5f0f6a2e-1b2c-4d3e-8f4a-9b8c7d6e5f4a";
const PRODUCT_ID = "6a1f7b3f-2c3d-4e5f-9a5b-0c9d8e7f6a5b";
const RESERVATION_ID = "7b2f8c4f-3d4e-4f6a-8b6c-1d0e9f8a7b6c";

/**
 * Stub chaînable minimal du client Supabase pour le tunnel.
 * `insert` retourne un builder à la fois chaînable (.select().single())
 * et awaitable (thenable) car certains inserts sont attendus directement.
 */
function supabaseStub({ available = 10 } = {}) {
  const single = vi
    .fn()
    .mockResolvedValue({ data: { id: RESERVATION_ID }, error: null });
  const insertBuilder = {
    select: vi.fn().mockReturnValue({ single }),
    then: (resolve: (v: { error: null }) => void) =>
      Promise.resolve({ error: null }).then(resolve),
  };
  const chain = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnValue(insertBuilder),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [] }),
    rpc: vi.fn().mockResolvedValue({ data: available }),
  };
  return chain;
}

function validInput() {
  return {
    shopId: SHOP_ID,
    customerName: "Marie Martin",
    customerEmail: "marie@example.com",
    customerPhone: "0601020304",
    startDate: "2026-08-01",
    endDate: "2026-08-05",
    items: [{ productId: PRODUCT_ID, quantity: 2, unitPrice: 1500, isOptional: false }],
    participantValues: [],
    acceptCgv: true,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createWebReservationAction — ordre NCF (action publique)", () => {
  it("rejette un input invalide AVANT tout accès à la base", async () => {
    const result = await createWebReservationAction({
      ...validInput(),
      customerEmail: "pas-un-email",
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors?.customerEmail).toBeDefined();
    expect(createClient).not.toHaveBeenCalled();
  });

  it("refuse si les CGV ne sont pas acceptées, sans toucher la base", async () => {
    const result = await createWebReservationAction({
      ...validInput(),
      acceptCgv: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Vous devez accepter les conditions générales.");
    }
    expect(createClient).not.toHaveBeenCalled();
  });

  it("refuse un shopId non-UUID sans toucher la base", async () => {
    const result = await createWebReservationAction({
      ...validInput(),
      shopId: "'; DROP TABLE reservations; --",
    });

    expect(result.success).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("refuse si le stock est insuffisant (VÉRIFICATION avant OPÉRATION)", async () => {
    const supabase = supabaseStub({ available: 1 });
    // EXCEPTION-TYPECAST: stub de test — seul le sous-ensemble chaîné est utilisé
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const result = await createWebReservationAction(validInput());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Un ou plusieurs produits ne sont plus disponibles.");
    }
    expect(supabase.insert).not.toHaveBeenCalled();
  });

  it("crée la réservation avec source 'web' et le total calculé côté serveur", async () => {
    const supabase = supabaseStub();
    // EXCEPTION-TYPECAST: stub de test — seul le sous-ensemble chaîné est utilisé
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const result = await createWebReservationAction(validInput());

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.reservationId).toBe(RESERVATION_ID);
    expect(supabase.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        shop_id: SHOP_ID,
        source: "web",
        total_price: 3000,
        customer_name: "Marie Martin",
      }),
    );
  });
});
