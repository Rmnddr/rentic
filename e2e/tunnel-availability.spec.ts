import { expect, test } from "@playwright/test";
import { bookingRange } from "./fixtures/dates";
import {
  cleanupTestShop,
  createBlockingReservation,
  seedTestShop,
  type SeededShop,
} from "./fixtures/seed";

// Slug dédié à ce fichier : aucune collision avec tunnel.spec.ts en parallèle
const SLUG = "e2e-dispo";

let shop: SeededShop;
const range = bookingRange();

test.beforeAll(async () => {
  shop = await seedTestShop({ slug: SLUG, name: "Glisse e2e Dispo" });

  // Tout le stock du premier produit (2 unités) est bloqué sur la période,
  // créé via la fonction Postgres — jamais via l'UI.
  await createBlockingReservation({
    shopId: shop.shopId,
    productId: shop.products[0].id,
    quantity: shop.products[0].unitIds.length,
    startDate: range.startIso,
    endDate: range.endIso,
  });
});

test.afterAll(async () => {
  await cleanupTestShop(SLUG);
});

test("un produit dont tout le stock est réservé apparaît indisponible", async ({
  page,
}) => {
  const [indisponible, disponible] = shop.products;

  await page.goto(`/s/${SLUG}/reserver`);

  await page.getByRole("button", { name: range.startLabel }).click();
  await page.getByRole("button", { name: range.endLabel }).click();
  await page.getByRole("button", { name: "Continuer" }).click();

  await expect(
    page.getByRole("heading", { name: "Choisissez votre matériel" }),
  ).toBeVisible();

  // Produit saturé : mention explicite et bouton d'ajout verrouillé
  const ligneIndisponible = page
    .getByRole("listitem")
    .filter({ hasText: indisponible.name });
  await expect(ligneIndisponible).toContainText("Indisponible sur ces dates");
  await expect(
    page.getByRole("button", { name: `Ajouter ${indisponible.name} au panier` }),
  ).toBeDisabled();

  // L'autre produit reste réservable
  const ligneDisponible = page
    .getByRole("listitem")
    .filter({ hasText: disponible.name });
  await expect(ligneDisponible).toContainText("2 disponibles");
  await expect(
    page.getByRole("button", { name: `Ajouter ${disponible.name} au panier` }),
  ).toBeEnabled();
});
