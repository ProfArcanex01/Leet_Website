import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leetgh.com";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date("2026-01-25"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date("2026-01-25"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/support`,
      lastModified: new Date("2026-01-25"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
