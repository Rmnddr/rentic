import { z } from "zod";

// URL d'image du bucket public Supabase `shop-media`.
//
// Ce champ arrive dans les formulaires via l'<input type="hidden"> rempli par
// le composant ImageUpload après upload — donc falsifiable côté client. On
// n'accepte que les URLs https pointant vers le chemin public du bucket, et,
// quand NEXT_PUBLIC_SUPABASE_URL est disponible (toujours le cas dans les
// actions serveur, cf. src/lib/env.ts), uniquement l'origine du projet
// Supabase. Toute autre valeur est refusée : `javascript:`, `data:`,
// domaine tiers, http:…

export const SHOP_MEDIA_PUBLIC_PATH = "/storage/v1/object/public/shop-media/";

function isShopMediaUrl(value: string): boolean {
  if (!value.startsWith("https://")) return false;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }

  if (!parsed.pathname.startsWith(SHOP_MEDIA_PUBLIC_PATH)) return false;

  // Épinglage d'origine — lu à l'exécution (pas à l'import) pour rester
  // testable et ne pas figer la valeur dans le bundle au moment du build.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      if (parsed.origin !== new URL(supabaseUrl).origin) return false;
    } catch {
      // NEXT_PUBLIC_SUPABASE_URL mal formée : on retombe sur le seul
      // contrôle de chemin (cas théorique, env.ts valide déjà l'URL).
    }
  }

  return true;
}

/**
 * URL publique du bucket `shop-media` — ou chaîne vide (pas d'image).
 * Réutilisé par les schémas produits, packs, boutique et site vitrine.
 * Composer côté consommateur : `.optional()` ± `.default("")`.
 */
export const shopMediaUrlSchema = z
  .string()
  .trim()
  .max(2000, "URL trop longue (max 2000 caractères).")
  .refine((value) => value === "" || isShopMediaUrl(value), {
    message: "L'image doit provenir de la médiathèque du magasin.",
  });
