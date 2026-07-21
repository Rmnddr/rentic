import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWebReservationAction } from "./actions";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
// L'import de admin/stripe déclenche la validation d'env — mocks obligatoires
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));
vi.mock("@/lib/stripe/config", () => ({ getStripe: vi.fn() }));

const SHOP_ID = "5f0f6a2e-1b2c-4d3e-8f4a-9b8c7d6e5f4a";
const PRODUCT_ID = "6a1f7b3f-2c3d-4e5f-9a5b-0c9d8e7f6a5b";
const RESERVATION_ID = "7b2f8c4f-3d4e-4f6a-8b6c-1d0e9f8a7b6c";

/** L'action ne fait plus qu'un seul rpc : create_web_reservation. */
function supabaseStub(rpcResult: { data: unknown; error: { message: string } | null }) {
  return { rpc: vi.fn().mockResolvedValue(rpcResult) };
}

function validInput() {
  return {
    shopId: SHOP_ID,
    customerName: "Marie Martin",
    customerEmail: "marie@example.com",
    customerPhone: "0601020304",
    startDate: "2026-08-01",
    endDate: "2026-08-05",
    items: [{ productId: PRODUCT_ID, quantity: 2, isOptional: false }],
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

  it("appelle create_web_reservation avec des items SANS prix client", async () => {
    const supabase = supabaseStub({ data: RESERVATION_ID, error: null });
    // EXCEPTION-TYPECAST: stub de test — seul rpc est utilisé
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const result = await createWebReservationAction(validInput());

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.reservationId).toBe(RESERVATION_ID);
    expect(supabase.rpc).toHaveBeenCalledWith(
      "create_web_reservation",
      expect.objectContaining({
        p_shop_id: SHOP_ID,
        p_items: [
          { product_id: PRODUCT_ID, pack_id: null, quantity: 2, is_optional: false },
        ],
      }),
    );
    const args = supabase.rpc.mock.calls[0][1];
    expect(JSON.stringify(args)).not.toContain("unit_price");
  });

  it("traduit INSUFFICIENT_STOCK en message utilisateur", async () => {
    const supabase = supabaseStub({
      data: null,
      error: { message: `INSUFFICIENT_STOCK:${PRODUCT_ID}` },
    });
    // EXCEPTION-TYPECAST: stub de test — seul rpc est utilisé
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const result = await createWebReservationAction(validInput());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(
        "Un ou plusieurs produits ne sont plus disponibles sur cette période. Veuillez ajuster votre panier.",
      );
    }
  });

  it("traduit SHOP_NOT_PUBLIC en message utilisateur", async () => {
    const supabase = supabaseStub({ data: null, error: { message: "SHOP_NOT_PUBLIC" } });
    // EXCEPTION-TYPECAST: stub de test — seul rpc est utilisé
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const result = await createWebReservationAction(validInput());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Cette boutique n'accepte pas les réservations en ligne.");
    }
  });

  it("ne divulgue jamais le message SQL brut en cas d'erreur inconnue", async () => {
    const supabase = supabaseStub({
      data: null,
      error: { message: 'relation "reservations" does not exist' },
    });
    // EXCEPTION-TYPECAST: stub de test — seul rpc est utilisé
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const result = await createWebReservationAction(validInput());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("La réservation n'a pas pu être créée. Veuillez réessayer.");
    }
  });
});
