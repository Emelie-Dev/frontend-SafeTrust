import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Wallet auth journey", () => {
  test("successful wallet modal interaction on /login", async ({ page }) => {
    await page.goto("/login?redirect=/dashboard/escrow-dashboard");
    await expectHealthyPage(page);

    const walletBtn = page.locator(
      'button:has-text("Connect Stellar wallet"), button:has-text("Login with wallet")',
    );
    await expect(walletBtn).toBeVisible();
    await walletBtn.click();

    // Verify Wallet modal opens and contains options
    const modalHeading = page.locator("text=Connect Wallet");
    await expect(modalHeading).toBeVisible();

    const closeBtn = page.locator('button[aria-label="Close modal"]');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(modalHeading).not.toBeVisible();
    await expectHealthyPage(page);
  });

  test("rejected or closed modal stays on /login", async ({ page }) => {
    await page.goto("/login");
    await expectHealthyPage(page);

    const walletBtn = page.locator(
      'button:has-text("Connect Stellar wallet"), button:has-text("Login with wallet")',
    );
    await expect(walletBtn).toBeVisible();
    await walletBtn.click();

    const modalHeading = page.locator("text=Connect Wallet");
    await expect(modalHeading).toBeVisible();

    const closeBtn = page.locator('button[aria-label="Close modal"]');
    await closeBtn.click();

    await expect(page).toHaveURL(/\/login/);
    await expectHealthyPage(page);
  });
});
