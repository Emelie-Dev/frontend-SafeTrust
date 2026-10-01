/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await use(page);
    expect(
      errors.filter((e) => !/favicon|ResizeObserver|404 \(Not Found\)/.test(e)),
      "console errors",
    ).toEqual([]);
  },
});

export async function expectHealthyPage(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(0);
  expect(
    await page.locator("button button, a button, button a, a a").count(),
    "nested interactive elements",
  ).toBe(0);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(axe.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

export { expect };
