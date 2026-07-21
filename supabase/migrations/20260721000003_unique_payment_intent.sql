-- Filet de sécurité contre les paiements en double : un PaymentIntent Stripe
-- ne peut correspondre qu'à une seule ligne payments. Complète l'idempotence
-- applicative (réutilisation de l'intent pending + idempotencyKey Stripe).

CREATE UNIQUE INDEX uq_payments_stripe_payment_intent_id
  ON payments (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
