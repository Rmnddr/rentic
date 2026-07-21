import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "./server";

/**
 * Helpers d'authentification NCF — à appeler en ligne 1 de chaque server
 * action (ordre : AUTH → VALIDATION → VÉRIFICATION → OPÉRATION).
 * Union discriminée plutôt que throw : les actions retournent ActionResult,
 * une erreur jetée traverserait la frontière serveur en message générique.
 */
type AuthFailure = { ok: false; error: string };
type AuthSuccess = { ok: true; supabase: SupabaseClient; user: User };
type ShopSuccess = AuthSuccess & { shopId: string };

export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Non authentifié. Veuillez vous reconnecter." };
  }

  return { ok: true, supabase, user };
}

export async function requireShop(): Promise<ShopSuccess | AuthFailure> {
  const auth = await requireAuth();
  if (!auth.ok) return auth;

  const { data: shopId } = await auth.supabase.rpc("get_user_shop_id");
  if (typeof shopId !== "string" || shopId.length === 0) {
    return { ok: false, error: "Magasin introuvable." };
  }

  return { ...auth, shopId };
}
