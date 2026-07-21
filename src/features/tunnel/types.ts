// Données catalogue chargées côté serveur et passées au tunnel client.

export type TunnelProduct = {
  id: string;
  name: string;
  description: string | null;
  price_web: number;
  category_id: string;
};

export type TunnelCategory = {
  id: string;
  name: string;
};

export type TunnelAttribute = {
  id: string;
  category_id: string;
  name: string;
  format: "text" | "number" | "select";
  options: string[] | null;
  required: boolean;
};

export type TunnelPackItem = {
  product_id: string;
  is_required: boolean;
  price_web_override: number | null;
};

export type TunnelPack = {
  id: string;
  name: string;
  description: string | null;
  items: TunnelPackItem[];
};

export type TunnelCatalog = {
  shopId: string;
  shopSlug: string;
  shopName: string;
  hasCgv: boolean;
  /** La boutique a un compte Stripe Connect actif → paiement CB en ligne */
  onlinePayment: boolean;
  categories: TunnelCategory[];
  products: TunnelProduct[];
  participantAttributes: TunnelAttribute[];
  packs: TunnelPack[];
};

export type AvailabilityMap = Record<string, number>;
