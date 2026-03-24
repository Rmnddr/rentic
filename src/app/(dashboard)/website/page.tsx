import { Badge } from "@/components/ui/badge";
import { WebsiteEditor } from "@/features/website-builder/components/website-editor";
import { createClient } from "@/lib/supabase/server";
import { Globe } from "lucide-react";

export default async function WebsitePage() {
  const supabase = await createClient();
  const shopId = (await supabase.rpc("get_user_shop_id")).data;

  const { data: website } = await supabase
    .from("shop_websites")
    .select("hero_title, hero_subtitle, hero_image_url, cgv_content, is_published")
    .eq("shop_id", shopId ?? "")
    .single();

  const { data: shop } = await supabase
    .from("shops")
    .select("slug")
    .eq("id", shopId ?? "")
    .single();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">Site Web</h1>
          <p className="mt-1 text-body-sm text-muted-foreground">
            Configurez votre vitrine en ligne
          </p>
        </div>
        {website?.is_published && (
          <Badge variant="default" className="gap-1.5">
            <Globe className="h-3 w-3" />
            Publié
          </Badge>
        )}
      </header>

      <WebsiteEditor website={website} shopSlug={shop?.slug ?? ""} />
    </div>
  );
}
