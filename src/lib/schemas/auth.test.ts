import { describe, expect, it } from "vitest";
import { parseFormData } from "./parse";
import { signInSchema, signUpSchema } from "./auth";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("signUpSchema", () => {
  it("accepte un email et un mot de passe valides", () => {
    const result = parseFormData(
      signUpSchema,
      fd({ email: "romain@example.com", password: "motdepasse8" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({
        email: "romain@example.com",
        password: "motdepasse8",
      });
    }
  });

  it("rejette un email invalide avec une fieldError sur email", () => {
    const result = parseFormData(
      signUpSchema,
      fd({ email: "pas-un-email", password: "motdepasse8" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.email).toBeDefined();
      expect(result.error).toBe("Adresse email invalide.");
    }
  });

  it("rejette un email de plus de 320 caractères", () => {
    const longEmail = `${"a".repeat(310)}@example.com`;
    const result = parseFormData(
      signUpSchema,
      fd({ email: longEmail, password: "motdepasse8" }),
    );
    expect(result.ok).toBe(false);
  });

  it("rejette un mot de passe trop court (< 8) avec une fieldError", () => {
    const result = parseFormData(
      signUpSchema,
      fd({ email: "romain@example.com", password: "court" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.password).toEqual([
        "Le mot de passe doit contenir au moins 8 caractères.",
      ]);
    }
  });

  it("rejette un mot de passe de plus de 128 caractères", () => {
    const result = parseFormData(
      signUpSchema,
      fd({ email: "romain@example.com", password: "x".repeat(129) }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.password).toBeDefined();
  });

  it("rejette des champs manquants avec des fieldErrors sur chaque champ", () => {
    const result = parseFormData(signUpSchema, fd({}));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.email).toBeDefined();
      expect(result.fieldErrors.password).toBeDefined();
    }
  });
});

describe("signInSchema", () => {
  it("accepte des identifiants valides", () => {
    const result = parseFormData(
      signInSchema,
      fd({ email: "romain@example.com", password: "motdepasse8" }),
    );
    expect(result.ok).toBe(true);
  });

  it("rejette un email vide", () => {
    const result = parseFormData(
      signInSchema,
      fd({ email: "", password: "motdepasse8" }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.email).toBeDefined();
  });

  it("rejette un mot de passe trop court", () => {
    const result = parseFormData(
      signInSchema,
      fd({ email: "romain@example.com", password: "1234567" }),
    );
    expect(result.ok).toBe(false);
  });
});
