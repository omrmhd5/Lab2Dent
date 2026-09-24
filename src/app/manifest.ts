import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "Register a dental lab case, pay with Instapay, and track it with a code.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9f8f4",
    theme_color: "#133563",
    icons: [
      {
        src: "/Logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
