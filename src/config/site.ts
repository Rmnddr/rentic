export const siteConfig = {
  name: "Rentic",
  description:
    "Plateforme SaaS pour les loueurs de matériel sportif saisonnier",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
