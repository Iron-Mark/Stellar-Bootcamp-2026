import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Block crawlers from spidering the dynamic /proof/<hash> pages.
      // The static /proof lookup form (no trailing slash) stays crawlable.
      // Individual proof URLs are 64-char hex hashes — useless to index and
      // expensive to render if a bot spiders them at scale.
      disallow: "/proof/",
    },
    sitemap: "https://stellaroid-earn-demo.vercel.app/sitemap.xml",
  };
}
