import { expect, test } from "@playwright/test";

const SAMPLE_PROOF_HASH =
  "c02ce1602d5bbb6ddfe93c6603d7f4e3dae3b2fb571ea4e70669ccd5a359aea3";
const SAMPLE_PROOF_URL = `https://stellaroid.tech/proof/${SAMPLE_PROOF_HASH}`;

test("proof pages expose a canonical Open Graph URL", async ({ page }) => {
  await page.goto(`/proof/${SAMPLE_PROOF_HASH}`);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    SAMPLE_PROOF_URL,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    SAMPLE_PROOF_URL,
  );
});
