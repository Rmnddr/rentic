-- Correctif sécurité : webhook_events n'avait pas de RLS — n'importe quel
-- porteur de la clé anon pouvait y insérer (et fausser l'idempotence des
-- webhooks). RLS activé sans policy : seul le service role (webhooks via
-- client admin) y accède désormais.

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
