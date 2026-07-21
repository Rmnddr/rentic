-- Epic 9 : administration plateforme
--
-- Table dédiée plutôt qu'une valeur ajoutée à l'enum user_role : un admin
-- plateforme n'appartient à aucun magasin, et toucher à l'enum changerait
-- la sémantique de get_user_role() utilisé par toutes les policies RLS.
--
-- Les pages /admin lisent les données cross-tenant avec le client service
-- role APRÈS avoir vérifié is_platform_admin() : aucune policy cross-tenant
-- n'est ouverte, donc aucun risque de fuite entre magasins.

CREATE TABLE platform_admins (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Un admin peut vérifier son propre statut ; personne d'autre ne lit la table.
CREATE POLICY "Admins can read their own row"
  ON platform_admins FOR SELECT
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
$$;

-- =============================================================================
-- Vue des métriques d'abandon d'onboarding (story 9.3)
-- Lue uniquement via le client service role depuis /admin.
-- =============================================================================

CREATE OR REPLACE VIEW admin_onboarding_funnel AS
SELECT
  s.id            AS shop_id,
  s.name          AS shop_name,
  s.slug,
  s.created_at,
  s.onboarding_completed,
  p.onboarding_current_step,
  (SELECT count(*) FROM categories c WHERE c.shop_id = s.id)  AS categories_count,
  (SELECT count(*) FROM products pr WHERE pr.shop_id = s.id)  AS products_count,
  (SELECT count(*) FROM reservations r WHERE r.shop_id = s.id) AS reservations_count,
  EXISTS (SELECT 1 FROM shop_websites w WHERE w.shop_id = s.id AND w.is_published) AS website_published
FROM shops s
LEFT JOIN LATERAL (
  SELECT pr.onboarding_current_step
  FROM profiles pr
  WHERE pr.shop_id = s.id AND pr.role = 'owner'
  ORDER BY pr.created_at
  LIMIT 1
) p ON true;
