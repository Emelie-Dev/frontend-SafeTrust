import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Rent discovery journey", () => {
  test("select destination card, filter categories, reload and clear all", async ({
    page,
  }) => {
    await page.goto("/rent");
    await expectHealthyPage(page);

    // Select Heredia DestinationCard
    const herediaCard = page.locator(
      '[data-testid="destination-card-heredia"]',
    );
    await herediaCard.click();

    await expect(page).toHaveURL(/location=Heredia/);
    await expect(page.locator("h1")).toContainText("Heredia");
    await expectHealthyPage(page);

    // Toggle Students chip/checkbox
    const studentsCheckbox = page.locator(
      'label:has-text("Students") input[type="checkbox"]',
    );
    if (await studentsCheckbox.isVisible()) {
      await studentsCheckbox.click();
    } else {
      const sortFilterBtn = page.locator('button:has-text("Sort & Filter")');
      if (await sortFilterBtn.isVisible()) {
        await sortFilterBtn.click();
        const studentBtn = page.locator('button:has-text("Students")').first();
        if (await studentBtn.isVisible()) {
          await studentBtn.click();
        }
      }
    }

    // Reload keeps state
    await page.reload();
    await expect(page).toHaveURL(/location=Heredia/);
    await expect(page.locator("h1")).toContainText("Heredia");
    await expectHealthyPage(page);

    // Clear all
    const clearAllBtn = page.locator('button:has-text("Clear all")');
    await clearAllBtn.click();
    await expectHealthyPage(page);
  });
});
