import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock hoistés — l'import de send.ts déclenche env + admin + Resend.
const { sendMock, insertMock, envMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  insertMock: vi.fn(),
  envMock: { RESEND_API_KEY: undefined as string | undefined },
}));

vi.mock("resend", () => ({
  // `new Resend(...)` exige un vrai constructeur (pas d'arrow function)
  Resend: vi.fn(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

vi.mock("@/lib/env", () => ({ env: envMock }));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: insertMock })),
  })),
}));

import { sendEmail } from "./send";

const PARAMS = {
  to: "client@example.com",
  subject: "Réservation confirmée",
  html: "<p>Bonjour</p>",
  type: "booking_confirmation",
  shopId: "5f0f6a2e-1b2c-4d3e-8f4a-9b8c7d6e5f4a",
};

beforeEach(() => {
  vi.clearAllMocks();
  envMock.RESEND_API_KEY = undefined;
  insertMock.mockResolvedValue({ error: null });
  sendMock.mockResolvedValue({ data: { id: "email-id" }, error: null });
});

describe("sendEmail — fallback no-op sans clé", () => {
  it("retourne { sent: false } sans jeter quand RESEND_API_KEY est absente", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = await sendEmail(PARAMS);

    expect(result).toEqual({ sent: false });
    expect(sendMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      "[email] RESEND_API_KEY absente — email non envoyé:",
      "booking_confirmation",
    );
    warnSpy.mockRestore();
  });

  it("trace un email_logs en status skipped quand la clé est absente", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    await sendEmail(PARAMS);

    expect(insertMock).toHaveBeenCalledWith({
      shop_id: PARAMS.shopId,
      type: "booking_confirmation",
      recipient: "client@example.com",
      status: "skipped",
    });
  });

  it("ne jette pas même si l'insert email_logs échoue", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    insertMock.mockRejectedValue(new Error("db down"));

    await expect(sendEmail(PARAMS)).resolves.toEqual({ sent: false });
  });
});

describe("sendEmail — envoi via Resend avec clé", () => {
  beforeEach(() => {
    envMock.RESEND_API_KEY = "re_test_123";
  });

  it("envoie via Resend et retourne { sent: true }", async () => {
    const result = await sendEmail(PARAMS);

    expect(result).toEqual({ sent: true });
    expect(sendMock).toHaveBeenCalledWith({
      from: "Rentic <noreply@rentic.fr>",
      to: "client@example.com",
      subject: "Réservation confirmée",
      html: "<p>Bonjour</p>",
    });
    expect(insertMock).toHaveBeenCalledWith({
      shop_id: PARAMS.shopId,
      type: "booking_confirmation",
      recipient: "client@example.com",
      status: "sent",
    });
  });

  it("trace shop_id: null quand shopId n'est pas fourni", async () => {
    const { shopId: _ignored, ...sansShop } = PARAMS;

    await sendEmail(sansShop);

    expect(insertMock).toHaveBeenCalledWith({
      shop_id: null,
      type: "booking_confirmation",
      recipient: "client@example.com",
      status: "sent",
    });
  });

  it("retourne { sent: false } et trace failed quand Resend renvoie une erreur", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Invalid from address" },
    });

    const result = await sendEmail(PARAMS);

    expect(result).toEqual({ sent: false });
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed" }),
    );
  });

  it("retourne { sent: false } sans jeter quand Resend lève une exception", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    sendMock.mockRejectedValue(new Error("network timeout"));

    await expect(sendEmail(PARAMS)).resolves.toEqual({ sent: false });
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed" }),
    );
  });
});
