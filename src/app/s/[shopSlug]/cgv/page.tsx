import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ shopSlug: string }> };

export default async function CgvPage({ params }: Props) {
  await connection();
  const { shopSlug } = await params;
  const supabase = await createClient();

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name")
    .eq("slug", shopSlug)
    .single();

  if (!shop) notFound();

  const { data: website } = await supabase
    .from("shop_websites")
    .select("cgv_content")
    .eq("shop_id", shop.id)
    .single();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-h1">Conditions Générales — {shop.name}</h1>
      {website?.cgv_content ? (
        <div className="prose max-w-none whitespace-pre-wrap">
          {website.cgv_content}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Aucune condition générale définie.
        </p>
      )}
    </main>
  );
}
