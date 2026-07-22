"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/shared/image-upload";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  shop: {
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    siret: string | null;
    tva_number: string | null;
    logo_url: string | null;
  };
  shopId: string;
};

export function EditShopForm({ shop, shopId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const getField = (name: string): string => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };

    // Use inline server action import to avoid circular deps
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase
      .from("shops")
      .update({
        name: getField("name"),
        email: getField("email") || null,
        phone: getField("phone") || null,
        address: getField("address") || null,
        siret: getField("siret") || null,
        tva_number: getField("tvaNumber") || null,
        logo_url: getField("logoUrl") || null,
      })
      .eq("id", shopId);

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Enregistré !");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="shop-name">Nom du magasin</Label>
        <Input id="shop-name" name="name" defaultValue={shop.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="shop-email">Email</Label>
        <Input id="shop-email" name="email" type="email" defaultValue={shop.email ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="shop-phone">Téléphone</Label>
        <Input id="shop-phone" name="phone" type="tel" defaultValue={shop.phone ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="shop-address">Adresse</Label>
        <Input id="shop-address" name="address" defaultValue={shop.address ?? ""} />
      </div>
      <ImageUpload
        folder="logo"
        name="logoUrl"
        label="Logo"
        defaultValue={shop.logo_url}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="shop-siret">SIRET</Label>
          <Input id="shop-siret" name="siret" defaultValue={shop.siret ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shop-tva">N° TVA</Label>
          <Input id="shop-tva" name="tvaNumber" defaultValue={shop.tva_number ?? ""} />
        </div>
      </div>
      {message && (
        <p className={`text-sm ${message.startsWith("Erreur") ? "text-destructive" : "text-success"}`}>
          {message}
        </p>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
