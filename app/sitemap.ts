import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/** Plan du site : page d'accueil + FAQ + pages légales (mentions, confidentialité, CGV). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE.url, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE.url}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE.url}/mentions-legales`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE.url}/politique-de-confidentialite`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE.url}/cgv`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
