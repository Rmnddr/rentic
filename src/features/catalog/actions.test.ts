import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCategoryAction, deleteProductAction } from "./actions";
import { requireAuth, requireShop } from "@/lib/supabase/auth";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/auth", () => ({
  requireAuth: vi.fn(),
  requireShop: vi.fn(),
}));

const UUID = "5f0f6a2e-1b2c-4d3e-8f4a-9b8c7d6e5f4a";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

/** Stub chaînable minimal du client Supabase pour le chemin nominal. */
function supabaseStub(result: unknown) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
    single: vi.fn().mockResolvedValue(result),
  };
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createCategoryAction — ordre NCF", () => {
  it("refuse sans authentification, AVANT toute validation", async () => {
    vi.mocked(requireShop).mockResolvedValue({ ok: false, error: "Non authentifié." });

    const result = await createCategoryAction(fd({ name: "Skis" }));

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Non authentifié.");
  });

  it("refuse une donnée invalide sans toucher la base", async () => {
    const supabase = supabaseStub({ data: { id: UUID }, error: null });
    vi.mocked(requireShop).mockResolvedValue({
      ok: true,
      // EXCEPTION-TYPECAST: stub de test — seul le sous-ensemble chaîné est utilisé
      supabase: supabase as never,
      user: { id: "user-1" } as never,
      shopId: UUID,
    });

    const result = await createCategoryAction(fd({ name: "" }));

    expect(result.success).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("insère avec le shop_id du contexte auth (jamais du client)", async () => {
    const supabase = supabaseStub({ data: { id: UUID }, error: null });
    vi.mocked(requireShop).mockResolvedValue({
      ok: true,
      // EXCEPTION-TYPECAST: stub de test — seul le sous-ensemble chaîné est utilisé
      supabase: supabase as never,
      user: { id: "user-1" } as never,
      shopId: UUID,
    });

    const result = await createCategoryAction(fd({ name: "Skis" }));

    expect(result.success).toBe(true);
    expect(supabase.insert).toHaveBeenCalledWith({
      shop_id: UUID,
      name: "Skis",
      type: "product",
    });
  });
});

describe("deleteProductAction", () => {
  it("rejette un id non-UUID avant la base", async () => {
    const supabase = supabaseStub({ data: null, error: null });
    vi.mocked(requireAuth).mockResolvedValue({
      ok: true,
      // EXCEPTION-TYPECAST: stub de test — seul le sous-ensemble chaîné est utilisé
      supabase: supabase as never,
      user: { id: "user-1" } as never,
    });

    const result = await deleteProductAction(fd({ id: "DROP TABLE products" }));

    expect(result.success).toBe(false);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
