import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EditShopForm } from "@/features/dashboard/components/edit-shop-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, shop_id")
    .eq("id", user?.id ?? "")
    .single();

  const { data: shop } = await supabase
    .from("shops")
    .select("name, slug, email, phone, address, siret, tva_number")
    .eq("id", profile?.shop_id ?? "")
    .single();

  const { data: stripeAccount } = await supabase
    .from("shop_stripe_accounts")
    .select("charges_enabled, payouts_enabled")
    .eq("shop_id", profile?.shop_id ?? "")
    .single();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-h1">Paramètres</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Gérez les informations de votre magasin
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shop info — editable */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">Magasin</CardTitle>
            <CardDescription>
              Informations publiques de votre boutique
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shop && (
              <EditShopForm shop={shop} shopId={profile?.shop_id ?? ""} />
            )}
          </CardContent>
        </Card>

        {/* Profile + Stripe info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h3">Compte</CardTitle>
            <CardDescription>Vos informations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">Prénom</span>
              <span className="text-sm font-medium">
                {profile?.first_name || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">Nom</span>
              <span className="text-sm font-medium">
                {profile?.last_name || "—"}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">
                Stripe Connect
              </span>
              {stripeAccount?.charges_enabled ? (
                <Badge variant="default">Paiements actifs</Badge>
              ) : (
                <Badge variant="outline">Non configuré</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
