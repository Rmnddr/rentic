"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateCgvAction, updateWebsiteAction } from "@/features/website-builder/actions";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  website: {
    hero_title: string | null;
    hero_subtitle: string | null;
    hero_image_url: string | null;
    cgv_content: string | null;
    is_published: boolean;
  } | null;
  shopSlug: string;
};

export function WebsiteEditor({ website, shopSlug }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCgvLoading, setIsCgvLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await updateWebsiteAction(formData);
    if (result.success) {
      setMessage("Site mis à jour !");
      router.refresh();
    }
    setIsLoading(false);
  }

  async function handleCgvSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsCgvLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateCgvAction(formData);
    if (result.success) {
      setMessage("CGV mises à jour !");
      router.refresh();
    }
    setIsCgvLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Landing page editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Landing page</CardTitle>
          <CardDescription>
            Personnalisez le hero et les informations affichées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Titre hero</Label>
              <Input
                id="heroTitle"
                name="heroTitle"
                defaultValue={website?.hero_title ?? ""}
                placeholder="Bienvenue chez..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Sous-titre</Label>
              <Input
                id="heroSubtitle"
                name="heroSubtitle"
                defaultValue={website?.hero_subtitle ?? ""}
                placeholder="Location de matériel sportif..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroImageUrl">URL image hero</Label>
              <Input
                id="heroImageUrl"
                name="heroImageUrl"
                defaultValue={website?.hero_image_url ?? ""}
                placeholder="https://..."
              />
            </div>

            <input type="hidden" name="sections" value="[]" />

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isPublished">Publication</Label>
                <p className="text-caption text-muted-foreground">
                  Rendre le site visible sur{" "}
                  <span className="font-medium text-primary">/s/{shopSlug}</span>
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  value="true"
                  defaultChecked={website?.is_published ?? false}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-border after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
              </label>
            </div>

            {message && (
              <p className="text-sm text-success">{message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* CGV editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">CGV / CGU</CardTitle>
          <CardDescription>
            Conditions générales affichées sur votre site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCgvSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cgvContent">Contenu</Label>
              <textarea
                id="cgvContent"
                name="cgvContent"
                rows={8}
                defaultValue={website?.cgv_content ?? ""}
                placeholder="Saisissez vos conditions générales..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button type="submit" disabled={isCgvLoading}>
              {isCgvLoading ? "Enregistrement..." : "Enregistrer les CGV"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview link */}
      {website?.is_published && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Votre site est en ligne</p>
                <p className="text-caption text-muted-foreground">
                  /s/{shopSlug}
                </p>
              </div>
            </div>
            <a
              href={`/s/${shopSlug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                Voir le site
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
