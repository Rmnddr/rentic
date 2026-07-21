import { formatDateFr } from "@/lib/utils/format-date";

/** Formate un timestamptz ISO → "21 juillet 2026". */
export function formatShortDate(isoTimestamp: string): string {
  return formatDateFr(isoTimestamp.slice(0, 10));
}

/** "inscrit il y a 3 jours" / "inscrit aujourd'hui" */
export function formatSignupAge(days: number): string {
  if (days <= 0) return "inscrit aujourd'hui";
  if (days === 1) return "inscrit il y a 1 jour";
  return `inscrit il y a ${days} jours`;
}
