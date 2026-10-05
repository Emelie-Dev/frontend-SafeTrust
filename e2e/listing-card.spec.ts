import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Listing card keyboard and booking journey", () => {
  test("keyboard navigation to detail page and book redirect when logged out", async ({
    page,
  }) => {
    await page.goto("/rent");
    await expectHealthyPage(page);

    // Focus the first card and press Enter
    const firstCard = page.locator('[role="article"]').first();
    await firstCard.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/rent\/\d+/);
    await expectHealthyPage(page);

    // Click BOOK button while logged out -> redirects to /login?redirect=...
    const bookBtn = page
      .locator(
        'button:has-text("BOOK"), button:has-text("Book"), a:has-text("Book")',
      )
      .first();
    await expect(bookBtn).toBeVisible({ timeout: 15000 });
    await bookBtn.click();

    await expect(page).toHaveURL(/\/login\?redirect=.+/, { timeout: 15000 });
    await expectHealthyPage(page);
  });
});
