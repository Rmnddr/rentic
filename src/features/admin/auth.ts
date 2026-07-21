import { requireAuth } from "@/lib/supabase/auth";

/**
 * Défense en profondeur : le middleware bloque déjà /admin pour les
 * non-administrateurs, mais chaque entrée serveur re-vérifie le rôle avec le
 * client AUTHENTIFIÉ (RLS active) avant toute lecture en service role.
 */
export async function isPlatformAdmin(): Promise<boolean> {
  const auth = await requireAuth();
  if (!auth.ok) return false;

  const { data, error } = await auth.supabase.rpc("is_platform_admin");
  if (error) return false;

  return data === true;
}
