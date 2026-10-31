import { expect, test } from "@playwright/test";

test("forsiden viser hero og kategorier", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Vær forberedt/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Kurv" })).toBeVisible();
});
