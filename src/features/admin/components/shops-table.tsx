import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatShortDate } from "../format";
import type { ShopListRow } from "../types";
import { SubscriptionStatusBadge } from "./subscription-status-badge";

export function ShopsTable({ rows }: { rows: ShopListRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-body-sm text-muted-foreground">
        Aucun loueur à afficher.
      </p>
    );
  }

  return (
    <Table>
      <caption className="sr-only">
        Liste des loueurs inscrits sur la plateforme, du plus récent au plus
        ancien
      </caption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Loueur</TableHead>
          <TableHead scope="col">Inscription</TableHead>
          <TableHead scope="col">Abonnement</TableHead>
          <TableHead scope="col" className="text-right">
            Produits
          </TableHead>
          <TableHead scope="col" className="text-right">
            Réservations
          </TableHead>
          <TableHead scope="col">Site web</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <span className="font-medium">{row.name}</span>
              <span className="block text-caption text-muted-foreground">
                /{row.slug}
              </span>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {formatShortDate(row.createdAt)}
            </TableCell>
            <TableCell>
              <SubscriptionStatusBadge status={row.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.productsCount}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {row.reservationsCount}
            </TableCell>
            <TableCell>
              {row.websitePublished ? "Publié" : "Non publié"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
