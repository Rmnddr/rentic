import { afterEach, describe, expect, it, vi } from "vitest";
import { shopMediaUrlSchema } from "./shop-media";

const SUPABASE_URL = "https://abcdefgh.supabase.co";
const BUCKET_URL = `${SUPABASE_URL}/storage/v1/object/public/shop-media/shop-1/products/photo.webp`;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("shopMediaUrlSchema", () => {
  it("accepte une URL publique du bucket shop-media", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
    const result = shopMediaUrlSchema.safeParse(BUCKET_URL);
    expect(result.success).toBe(true);
  });

  it("accepte la chaîne vide (pas d'image)", () => {
    const result = shopMediaUrlSchema.safeParse("");
    expect(result.success).toBe(true);
  });

  it("refuse une URL externe (origine tierce)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
    const result = shopMediaUrlSchema.safeParse("https://evil.example.com/photo.jpg");
    expect(result.success).toBe(false);
  });

  it("refuse une origine tierce même avec le chemin du bucket (input caché falsifiable)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
    const result = shopMediaUrlSchema.safeParse(
      "https://evil.example.com/storage/v1/object/public/shop-media/x.jpg",
    );
    expect(result.success).toBe(false);
  });

  it("refuse une URL javascript:", () => {
    const result = shopMediaUrlSchema.safeParse("javascript:alert(1)");
    expect(result.success).toBe(false);
  });

  it("refuse http:// (https obligatoire)", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
    const result = shopMediaUrlSchema.safeParse(
      BUCKET_URL.replace("https://", "http://"),
    );
    expect(result.success).toBe(false);
  });

  it("refuse une URL trop longue", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
    const result = shopMediaUrlSchema.safeParse(
      `${BUCKET_URL}?x=${"a".repeat(2001)}`,
    );
    expect(result.success).toBe(false);
  });

  it("sans NEXT_PUBLIC_SUPABASE_URL, retombe sur le contrôle de chemin seul", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const ok = shopMediaUrlSchema.safeParse(BUCKET_URL);
    expect(ok.success).toBe(true);
    const ko = shopMediaUrlSchema.safeParse("https://evil.example.com/photo.jpg");
    expect(ko.success).toBe(false);
  });
});
