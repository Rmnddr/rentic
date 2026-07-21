import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatShortDate } from "../format";
import type { LatestShop } from "../types";
import { SubscriptionStatusBadge } from "./subscription-status-badge";

export function LatestShopsTable({ shops }: { shops: LatestShop[] }) {
  if (shops.length === 0) {
    return (
      <p className="py-10 text-center text-body-sm text-muted-foreground">
        Aucun loueur inscrit pour le moment.
      </p>
    );
  }

  return (
    <Table>
      <caption className="sr-only">Les 10 derniers loueurs inscrits</caption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Loueur</TableHead>
          <TableHead scope="col">Inscription</TableHead>
          <TableHead scope="col">Abonnement</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shops.map((shop) => (
          <TableRow key={shop.id}>
            <TableCell className="font-medium">{shop.name}</TableCell>
            <TableCell className="whitespace-nowrap">
              {formatShortDate(shop.createdAt)}
            </TableCell>
            <TableCell>
              <SubscriptionStatusBadge status={shop.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
