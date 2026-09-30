import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Suggestions journey", () => {
  test("select suggestion row 3 and toggle favorite", async ({ page }) => {
    await page.goto("/guest/suggestions");
    await expectHealthyPage(page);

    // Select row 3
    const row3 = page.locator('aside [role="button"]').nth(2);
    await row3.click();

    await expect(page.locator("main h1")).toContainText(
      "Estudio Moderno San Pedro",
    );
    await expectHealthyPage(page);

    // Toggle favorite and check aria-pressed
    const favoriteBtn = row3.locator('button[aria-label="Toggle favorite"]');
    const initialPressed = await favoriteBtn.getAttribute("aria-pressed");
    await favoriteBtn.click();
    const nextPressed = await favoriteBtn.getAttribute("aria-pressed");
    expect(nextPressed).not.toBe(initialPressed);

    await expectHealthyPage(page);
  });
});
