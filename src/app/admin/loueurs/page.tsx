import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShopsTable } from "@/features/admin/components/shops-table";
import { getShopsPage, SHOPS_PAGE_SIZE } from "@/features/admin/queries";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

/** Page demandée, bornée : entier ≥ 1, sinon 1. */
function parsePage(raw: string | undefined): number {
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminShopsPage({ searchParams }: Props) {
  const { page: rawPage } = await searchParams;
  const { rows, page, pageCount, total } = await getShopsPage(parsePage(rawPage));

  const rangeStart = total === 0 ? 0 : (page - 1) * SHOPS_PAGE_SIZE + 1;
  const rangeEnd = (page - 1) * SHOPS_PAGE_SIZE + rows.length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-h1">Loueurs</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Tous les magasins inscrits, du plus récent au plus ancien
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-h3">
            {total} loueur{total > 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ShopsTable rows={rows} />
        </CardContent>
      </Card>

      <nav
        className="flex flex-wrap items-center justify-between gap-3"
        aria-label="Pagination des loueurs"
      >
        <p className="text-body-sm text-muted-foreground" aria-live="polite">
          {rangeStart}–{rangeEnd} sur {total} · page {page} / {pageCount}
        </p>

        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/loueurs?page=${page - 1}`} rel="prev">
                Page précédente
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Page précédente
            </Button>
          )}

          {page < pageCount ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/loueurs?page=${page + 1}`} rel="next">
                Page suivante
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Page suivante
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
}
