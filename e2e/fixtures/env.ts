import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Next.js charge .env.local tout seul, mais pas Playwright : on le parse
// nous-mêmes (aucune dépendance dotenv dans le projet).

let loaded = false;

function loadEnvFile(): void {
  if (loaded) return;
  loaded = true;

  let raw: string;
  try {
    raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  } catch {
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function requireEnv(name: string): string {
  loadEnvFile();
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante pour les tests e2e : ${name}`,
    );
  }
  return value;
}
