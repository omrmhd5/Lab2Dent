import { getTranslations } from "next-intl/server";

export async function apiError(
  key: string,
  values?: Record<string, string | number>,
) {
  const t = await getTranslations("api");
  return values ? t(key, values) : t(key);
}
