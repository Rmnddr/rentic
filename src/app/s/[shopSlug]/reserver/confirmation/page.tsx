import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Réservation confirmée" };

type Props = {
  params: Promise<{ shopSlug: string }>;
  searchParams: Promise<{ ref?: string; redirect_status?: string }>;
};

export default async function ConfirmationPage({ params, searchParams }: Props) {
  await connection();
  const { shopSlug } = await params;
  // redirect_status est ajouté par Stripe au retour du Payment Element
  const { ref, redirect_status: redirectStatus } = await searchParams;
  const paidOnline = redirectStatus === "succeeded";

  const supabase = await createClient();
  const { data: shop } = await supabase
    .from("shops")
    .select("name, email, phone")
    .eq("slug", shopSlug)
    .single();

  if (!shop) notFound();

  // La réservation elle-même n'est pas lisible par l'anonyme (RLS) — on
  // affiche uniquement la référence courte retournée à la création.
  const shortRef = ref?.slice(0, 8).toUpperCase();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-primary" aria-hidden />
        <h1 className="mt-4 text-h1">Réservation confirmée</h1>
        {shortRef && (
          <p className="mt-2 text-body-sm text-muted-foreground">
            Référence :{" "}
            <span className="font-mono font-semibold text-foreground">
              {shortRef}
            </span>
          </p>
        )}
        <p className="mt-4 text-body-sm text-muted-foreground">
          Votre matériel vous attendra chez <strong>{shop.name}</strong>.{" "}
          {paidOnline
            ? "Votre paiement a bien été reçu."
            : "Le paiement s'effectue sur place au retrait."}
        </p>
        {(shop.email || shop.phone) && (
          <p className="mt-2 text-body-sm text-muted-foreground">
            Une question ?{" "}
            {shop.phone && <span className="tabular-nums">{shop.phone}</span>}
            {shop.phone && shop.email && " · "}
            {shop.email && <span>{shop.email}</span>}
          </p>
        )}
        <Link
          href={`/s/${shopSlug}`}
          className="mt-6 inline-block text-body-sm underline"
        >
          Retour à la boutique
        </Link>
      </div>
    </main>
  );
}
