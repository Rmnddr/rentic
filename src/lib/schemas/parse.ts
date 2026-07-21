import { z } from "zod";

/**
 * Parsing NCF d'un FormData contre un schéma Zod.
 * Retourne les erreurs par champ au format attendu par ActionResult.
 */
export type ParseSuccess<T> = { ok: true; data: T };
export type ParseFailure = {
  ok: false;
  error: string;
  fieldErrors: Record<string, string[]>;
};

export function parseFormData<S extends z.ZodType>(
  schema: S,
  formData: FormData,
): ParseSuccess<z.output<S>> | ParseFailure {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    raw[key] = value;
  }
  return parseInput(schema, raw);
}

/** Variante pour les actions qui reçoivent un objet plutôt qu'un FormData. */
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
): ParseSuccess<z.output<S>> | ParseFailure {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  const fieldErrors: Record<string, string[]> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    fieldErrors[key] ??= [];
    fieldErrors[key].push(issue.message);
  }

  const firstMessage = parsed.error.issues[0]?.message ?? "Données invalides.";
  return { ok: false, error: firstMessage, fieldErrors };
}
