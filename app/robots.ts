import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/** Directives robots : tout indexable sauf l'API, + lien vers le sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
