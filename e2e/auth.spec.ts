import { expect, test } from "@playwright/test";

test.describe("Authentification", () => {
  test("refuse un mot de passe trop court avec le message français", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Connexion", level: 1 }),
    ).toBeVisible();

    await page.getByLabel("Email").fill("proprietaire@example.test");
    await page.getByLabel("Mot de passe").fill("court");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(
      page.getByText("Le mot de passe doit contenir au moins 8 caractères."),
    ).toBeVisible();

    // Aucune redirection : on reste sur la page de connexion
    await expect(page).toHaveURL(/\/login$/);
  });

  test("une route protégée redirige vers la connexion sans session", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Connexion", level: 1 }),
    ).toBeVisible();
  });
});

test.describe("Protection des routes d'administration", () => {
  test("/admin est introuvable pour un visiteur non authentifié", async ({
    page,
  }) => {
    const response = await page.goto("/admin");

    // Le proxy redirige vers la connexion : l'existence de /admin n'est
    // jamais révélée à un visiteur anonyme.
    await expect(page).toHaveURL(/\/login$/);
    expect(response?.status()).toBeLessThan(400);
  });
});
