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
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/proof\/c02ce1602d5bbb6ddfe93c6603d7f4e3dae3b2fb571ea4e70669ccd5a359aea3\/opengraph-image/,
  );
});

test("proof Open Graph image renders as png", async ({ page, request }) => {
  await page.goto(`/proof/${SAMPLE_PROOF_HASH}`);

  const imageUrl = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");

  expect(imageUrl).toBeTruthy();

  const response = await request.get(imageUrl!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("unknown proof hashes do not get verified social claims", async ({ page }) => {
  const unknown =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

  await page.goto(`/proof/${unknown}`);

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /Proof Lookup/,
  );
  await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute(
    "content",
    /Payment settled|Verified, on-chain proof/i,
  );
  await expect(page.getByText("No record for this hash yet.")).toBeVisible();
});
