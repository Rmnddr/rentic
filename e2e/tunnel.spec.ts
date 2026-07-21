import { expect, test } from "@playwright/test";
import { bookingRange } from "./fixtures/dates";
import {
  cleanupTestShop,
  countUnitAssignments,
  findParticipantValues,
  findReservationByEmail,
  findReservationItems,
  seedTestShop,
  type SeededShop,
} from "./fixtures/seed";

// Les deux tests partagent la même boutique seedée : même worker obligatoire
test.describe.configure({ mode: "serial" });

const SLUG = "e2e-tunnel";
const CLIENT_EMAIL = "cliente.e2e@example.test";

let shop: SeededShop;

test.beforeAll(async () => {
  shop = await seedTestShop({ slug: SLUG, name: "Glisse e2e Tunnel" });
});

test.afterAll(async () => {
  await cleanupTestShop(SLUG);
});

test.describe("Tunnel de réservation public", () => {
  test("la vitrine affiche le catalogue et mène au tunnel", async ({ page }) => {
    await page.goto(`/s/${SLUG}`);

    await expect(
      page.getByRole("heading", { name: `Bienvenue chez ${shop.name}` }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Catalogue" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Skis" })).toBeVisible();

    for (const product of shop.products) {
      await expect(
        page.getByRole("heading", { name: product.name }),
      ).toBeVisible();
    }

    await page.getByRole("link", { name: "Réserver en ligne" }).click();
    await expect(page).toHaveURL(new RegExp(`/s/${SLUG}/reserver$`));
    await expect(
      page.getByRole("heading", { name: `Réserver chez ${shop.name}` }),
    ).toBeVisible();
  });

  test("parcours complet jusqu'à la confirmation de réservation", async ({
    page,
  }) => {
    const range = bookingRange();
    const product = shop.products[0];

    await page.goto(`/s/${SLUG}/reserver`);

    // ── Étape 1 : dates ──────────────────────────────────────────
    await expect(
      page.getByRole("heading", { name: "Choisissez vos dates de location" }),
    ).toBeVisible();

    await page.getByRole("button", { name: range.startLabel }).click();
    await page.getByRole("button", { name: range.endLabel }).click();

    await page.getByRole("button", { name: "Continuer" }).click();

    // ── Étape 2 : matériel ───────────────────────────────────────
    await expect(
      page.getByRole("heading", { name: "Choisissez votre matériel" }),
    ).toBeVisible();

    const continuerMateriel = page.getByRole("button", { name: "Continuer" });
    await expect(continuerMateriel).toBeDisabled();

    await page
      .getByRole("button", { name: `Ajouter ${product.name} au panier` })
      .click();

    // Espace insécable étroite avant « € » : on assert sur le montant seul
    await expect(page.getByText(/Total indicatif/)).toContainText("45,00");
    await expect(continuerMateriel).toBeEnabled();
    await continuerMateriel.click();

    // ── Étape 3 : participants ───────────────────────────────────
    await expect(
      page.getByRole("heading", { name: "Informations participants" }),
    ).toBeVisible();

    const continuerParticipants = page.getByRole("button", {
      name: "Continuer",
    });
    // Le champ obligatoire est vide → impossible d'avancer
    await expect(continuerParticipants).toBeDisabled();
    await expect(
      page.getByText("Renseignez les champs obligatoires (*) pour continuer."),
    ).toBeVisible();

    await page.getByLabel(shop.attributeName).fill("42");

    await expect(continuerParticipants).toBeEnabled();
    await continuerParticipants.click();

    // ── Étape 4 : récapitulatif ──────────────────────────────────
    await expect(
      page.getByRole("heading", { name: "Récapitulatif" }),
    ).toBeVisible();
    await expect(page.getByText(`${product.name} × 1`)).toBeVisible();

    await page.getByLabel("Nom complet").fill("Camille Testeuse");
    await page.getByLabel("Email").fill(CLIENT_EMAIL);
    await page.getByLabel("Téléphone (optionnel)").fill("0612345678");

    const confirmer = page.getByRole("button", {
      name: "Confirmer la réservation",
    });
    // CGV non acceptées → bouton verrouillé
    await expect(confirmer).toBeDisabled();

    await page
      .getByRole("checkbox", { name: /J'accepte les conditions générales/ })
      .click();

    await expect(confirmer).toBeEnabled();
    await confirmer.click();

    // ── Confirmation ─────────────────────────────────────────────
    await expect(
      page.getByRole("heading", { name: "Réservation confirmée" }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/\/reserver\/confirmation\?ref=/);

    const reference = page.getByText(/^Référence :/);
    await expect(reference).toBeVisible();
    await expect(reference).toContainText(/[0-9A-F]{8}/);

    // ── Assertions base de données ───────────────────────────────
    const reservation = await findReservationByEmail(shop.shopId, CLIENT_EMAIL);
    expect(reservation).not.toBeNull();
    expect(reservation?.source).toBe("web");
    expect(reservation?.status).toBe("confirmed");
    expect(reservation?.total_price).toBe(product.priceWeb);
    expect(reservation?.start_date).toBe(range.startIso);
    expect(reservation?.end_date).toBe(range.endIso);
    expect(reservation?.customer_name).toBe("Camille Testeuse");

    const items = await findReservationItems(reservation!.id);
    expect(items).toHaveLength(1);
    expect(items[0].product_id).toBe(product.id);
    expect(items[0].quantity).toBe(1);
    expect(items[0].unit_price).toBe(product.priceWeb);

    // Une unité physique a bien été assignée
    expect(await countUnitAssignments(items[0].id)).toBe(1);

    const participantValues = await findParticipantValues(items[0].id);
    expect(participantValues).toHaveLength(1);
    expect(participantValues[0].value).toBe("42");
    expect(participantValues[0].category_attribute_id).toBe(shop.attributeId);
  });
});
