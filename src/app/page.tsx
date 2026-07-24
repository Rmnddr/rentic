import { Landing } from "@/features/marketing/components/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rentic — Votre magasin de location en ligne en 15 minutes",
  description:
    "Site vitrine, réservations 24/7, paiement sécurisé et gestion des stocks centralisée. Pensé pour les loueurs de matériel sportif saisonnier, sans compétence technique.",
};

export default function Home() {
  return <Landing />;
}
