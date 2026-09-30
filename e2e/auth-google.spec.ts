import { test, expect, expectHealthyPage } from "./fixtures";

test.describe("Google auth journey via emulator", () => {
  test("google provider login in emulator lands on redirect target", async ({
    page,
  }) => {
    await page.goto("/login?redirect=/dashboard/escrow-dashboard");
    await expectHealthyPage(page);

    const googleBtn = page.locator('button:has-text("Login with Google")');
    await expect(googleBtn).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup").catch(() => null),
      googleBtn.click(),
    ]);

    if (popup) {
      await popup.waitForLoadState("domcontentloaded");
      const submitBtn = popup
        .locator(
          'button[type="submit"], button#submit, button:has-text("Sign in"), button:has-text("Add")',
        )
        .first();
      if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submitBtn.click();
      }
    }

    await expect(page).toHaveURL(/\/dashboard/);
    await expectHealthyPage(page);
  });
});
