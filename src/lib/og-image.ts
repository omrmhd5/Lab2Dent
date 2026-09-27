export const OG_IMAGE_PATH = "/opengraph-image";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_TYPE = "image/png";

export function buildSocialImages(alt: string) {
  return {
    openGraph: {
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt,
          type: OG_IMAGE_TYPE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt,
          type: OG_IMAGE_TYPE,
        },
      ],
    },
  };
}
