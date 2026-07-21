// Currency formatting utilities — EUR / French conventions

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

/** Formate un montant en centimes → "12,50 €" */
export function formatCurrency(cents: number): string {
  return eurFormatter.format(cents / 100);
}
