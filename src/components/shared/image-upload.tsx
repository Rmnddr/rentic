"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

// Upload direct navigateur → Supabase Storage (bucket `shop-media`).
// La sécurité ne repose PAS sur ce composant : le bucket impose la taille
// max (5 Mo) et les types MIME, et les policies RLS n'autorisent l'écriture
// que dans le dossier {shopId}/ du membre connecté. Les contrôles côté
// client ci-dessous ne servent qu'à un feedback immédiat.
//
// Intégration formulaire : le composant expose l'URL publique via un
// <input type="hidden" name={name}> — compatible avec les server actions
// existantes en FormData, sans état à remonter.

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function ImageUpload({
  folder,
  name,
  label,
  defaultValue,
}: {
  /** Sous-dossier métier : "products", "packs", "logo", "website"… */
  folder: string;
  /** Nom du champ caché soumis avec le formulaire */
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = `image-upload-${name}`;

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format non pris en charge (JPEG, PNG, WebP ou AVIF).");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Image trop lourde (5 Mo maximum).");
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();

      // Le préfixe {shop_id}/ est imposé par les policies RLS du bucket :
      // on le résout ici plutôt que de le faire transiter par chaque page.
      const { data: shopId } = await supabase.rpc("get_user_shop_id");
      if (typeof shopId !== "string" || shopId.length === 0) {
        setError("Impossible d'identifier votre magasin.");
        return;
      }

      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${shopId}/${folder}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("shop-media")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError("L'envoi a échoué. Veuillez réessayer.");
        return;
      }

      const { data } = supabase.storage.from("shop-media").getPublicUrl(path);
      setUrl(data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        id={fieldId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          // Permet de re-sélectionner le même fichier après suppression
          e.target.value = "";
        }}
      />

      {url ? (
        <div className="flex items-center gap-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-secondary">
            <Image
              src={url}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Remplacer
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive"
              disabled={uploading}
              onClick={() => setUrl("")}
            >
              <Trash2 className="size-3.5" aria-hidden />
              Retirer
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="gap-1.5"
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Envoi en cours…
            </>
          ) : (
            <>
              <ImagePlus className="size-4" aria-hidden />
              Ajouter une image
            </>
          )}
        </Button>
      )}

      {error && (
        <p role="alert" className="text-caption text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
