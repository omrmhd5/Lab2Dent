import type { Locale } from "@/lib/locale";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

export type Messages = typeof en.public;

export function getMessages(locale: Locale): Messages {
  return (locale === "ar" ? ar.public : en.public) as Messages;
}
