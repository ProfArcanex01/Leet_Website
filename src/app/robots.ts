import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leetgh.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/ops-9xk3/", "/admin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
