import { getRequestConfig } from "next-intl/server";
import { getLocale } from "@/lib/locale";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

export default getRequestConfig(async () => {
  const locale = await getLocale();

  return {
    locale,
    messages: locale === "ar" ? ar : en,
  };
});
