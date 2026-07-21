// Date formatting utilities — French locale

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Formate une date ISO (AAAA-MM-JJ) → "1 août 2026". Entrée invalide → "". */
export function formatDateFr(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return "";
  return dateFormatter.format(new Date(year, month - 1, day));
}

/** Date du jour au format ISO local (AAAA-MM-JJ) */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Date → ISO local (AAAA-MM-JJ), sans décalage UTC */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}
