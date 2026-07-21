import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatShortDate, formatSignupAge } from "../format";
import type { OnboardingFunnelRow } from "../types";

// Libellés des étapes du wizard d'onboarding (3 étapes, cf.
// features/onboarding/components/onboarding-wizard.tsx).
const STEP_LABELS: Record<number, string> = {
  1: "Étape 1/3 — Profil",
  2: "Étape 2/3 — Magasin",
  3: "Étape 3/3 — Première catégorie",
};

function stepLabel(step: number | null): string {
  if (step === null) return "Étape inconnue";
  return STEP_LABELS[step] ?? `Étape ${step}/3`;
}

type OnboardingTableProps = {
  rows: OnboardingFunnelRow[];
  caption: string;
  emptyLabel: string;
  /** Affiche la colonne « Étape atteinte » (onboarding incomplet uniquement). */
  showStep: boolean;
};

export function OnboardingTable({
  rows,
  caption,
  emptyLabel,
  showStep,
}: OnboardingTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-body-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <Table>
      <caption className="sr-only">{caption}</caption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Loueur</TableHead>
          <TableHead scope="col">Inscription</TableHead>
          {showStep && <TableHead scope="col">Étape atteinte</TableHead>}
          <TableHead scope="col" className="text-right">
            Catégories
          </TableHead>
          <TableHead scope="col" className="text-right">
            Produits
          </TableHead>
          <TableHead scope="col" className="text-right">
            Réservations
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.shopId}>
            <TableCell>
              <span className="font-medium">{row.shopName}</span>
              <span className="block text-caption text-muted-foreground">
                /{row.slug}
              </span>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {formatShortDate(row.createdAt)}
              <span className="block text-caption text-muted-foreground">
                {formatSignupAge(row.daysSinceSignup)}
              </span>
            </TableCell>
            {showStep && (
              <TableCell className="whitespace-nowrap">
                {stepLabel(row.currentStep)}
              </TableCell>
            )}
            <TableCell className="text-right tabular-nums">
              {row.categoriesCount}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.productsCount}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.reservationsCount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
