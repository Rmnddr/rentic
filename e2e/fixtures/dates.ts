import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type BookingRange = {
  start: Date;
  end: Date;
  startIso: string;
  endIso: string;
  /** Nom accessible du bouton jour de react-day-picker (locale fr) */
  startLabel: string;
  endLabel: string;
};

function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Plage de location toujours FUTURE, calculée dynamiquement.
 *
 * On vise le mois suivant (le calendrier affiche 2 mois à partir du mois
 * courant, donc pas de navigation nécessaire) et des jours situés au milieu
 * du mois — jamais des jours "outside" dupliqués dans la grille voisine.
 */
export function bookingRange(startDay = 10, endDay = 12): BookingRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + 1, startDay);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, endDay);

  return {
    start,
    end,
    startIso: toIsoDate(start),
    endIso: toIsoDate(end),
    // react-day-picker v9 : aria-label = format "PPPP" dans la locale fournie
    startLabel: format(start, "PPPP", { locale: fr }),
    endLabel: format(end, "PPPP", { locale: fr }),
  };
}
