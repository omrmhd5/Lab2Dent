import type { Locale } from "@/lib/locale";

export type SeoPageKey =
  | "home"
  | "newCase"
  | "track"
  | "trackCode"
  | "login"
  | "dashboard";

type SeoPageCopy = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  noIndex?: boolean;
};

type SeoRootCopy = {
  title: string;
  description: string;
  ogImageAlt: string;
  keywords: string[];
};

export const seoCopy: Record<
  Locale,
  { default: SeoRootCopy; pages: Record<SeoPageKey, SeoPageCopy> }
> = {
  en: {
    default: {
      title: "Lab2Dent — We handle the rest.",
      description:
        "Register a dental lab case, pay with Instapay, and track it with a code. Built for dental students in Egypt.",
      ogImageAlt:
        "Lab2Dent — student dental cases between campus and the lab",
      keywords: [
        "Lab2Dent",
        "dental lab",
        "dental students",
        "Egypt",
        "Instapay",
        "case tracking",
        "dental cases",
      ],
    },
    pages: {
      home: {
        title: "Lab2Dent — We handle the rest.",
        description:
          "Register your case, send an Instapay screenshot, and follow it with a tracking code. For dental students in Egypt.",
        path: "/",
        keywords: [
          "dental lab Egypt",
          "student dental cases",
          "Instapay dental lab",
          "Lab2Dent",
        ],
      },
      newCase: {
        title: "Register a case",
        description:
          "Submit a new dental lab case in a few minutes. Choose your university, select the work, pay with Instapay, and get a tracking code.",
        path: "/new-case",
        keywords: [
          "register dental case",
          "submit lab case",
          "Instapay payment",
          "Lab2Dent",
        ],
      },
      track: {
        title: "Track a case",
        description:
          "Look up the status of your dental lab case with your Lab2Dent tracking code.",
        path: "/track",
        keywords: ["track dental case", "case status", "Lab2Dent code"],
      },
      trackCode: {
        title: "Case {code}",
        description: "View the status and details of your Lab2Dent case.",
        path: "/track",
        keywords: ["case status", "Lab2Dent"],
        noIndex: true,
      },
      login: {
        title: "Staff login",
        description: "Sign in to the Lab2Dent staff dashboard.",
        path: "/login",
        keywords: ["Lab2Dent staff", "dental lab dashboard"],
        noIndex: true,
      },
      dashboard: {
        title: "Dashboard",
        description: "Lab2Dent staff dashboard for orders, categories, and team.",
        path: "/dashboard",
        keywords: ["Lab2Dent dashboard"],
        noIndex: true,
      },
    },
  },
  ar: {
    default: {
      title: "Lab2Dent — إحنا نتولى الباقي.",
      description:
        "سجّل حالة معمل أسنان، ادفع بإنستاباي، وتابعها بكود. مخصص لطلبة طب الأسنان في مصر.",
      ogImageAlt: "Lab2Dent — حالات طلبة الأسنان بين الجامعة والمعمل",
      keywords: [
        "Lab2Dent",
        "معمل أسنان",
        "طلبة طب الأسنان",
        "مصر",
        "إنستاباي",
        "تتبع الحالات",
        "حالات أسنان",
      ],
    },
    pages: {
      home: {
        title: "Lab2Dent — إحنا نتولى الباقي.",
        description:
          "سجّل حالتك، حوّل إنستاباي، وتابع الحالة بكود التتبع. لطلبة طب الأسنان في مصر.",
        path: "/",
        keywords: [
          "معمل أسنان مصر",
          "حالات طلبة الأسنان",
          "إنستاباي معمل أسنان",
          "Lab2Dent",
        ],
      },
      newCase: {
        title: "تسجيل حالة",
        description:
          "أرسل حالة معمل أسنان جديدة في دقائق. اختر جامعتك، حدد الشغل، ادفع بإنستاباي، واحصل على كود تتبع.",
        path: "/new-case",
        keywords: [
          "تسجيل حالة أسنان",
          "إرسال حالة معمل",
          "دفع إنستاباي",
          "Lab2Dent",
        ],
      },
      track: {
        title: "تتبع حالة",
        description:
          "اعرف حالة حالة معمل الأسنان باستخدام كود التتبع من Lab2Dent.",
        path: "/track",
        keywords: ["تتبع حالة أسنان", "حالة الطلب", "كود Lab2Dent"],
      },
      trackCode: {
        title: "الحالة {code}",
        description: "اعرض حالة وتفاصيل حالة Lab2Dent الخاصة بك.",
        path: "/track",
        keywords: ["حالة الطلب", "Lab2Dent"],
        noIndex: true,
      },
      login: {
        title: "دخول الموظفين",
        description: "سجّل الدخول إلى لوحة تحكم موظفي Lab2Dent.",
        path: "/login",
        keywords: ["موظفين Lab2Dent", "لوحة معمل أسنان"],
        noIndex: true,
      },
      dashboard: {
        title: "لوحة التحكم",
        description:
          "لوحة تحكم موظفي Lab2Dent للطلبات والفئات والفريق.",
        path: "/dashboard",
        keywords: ["لوحة Lab2Dent"],
        noIndex: true,
      },
    },
  },
};

export function fillSeo(
  template: string,
  values: Record<string, string>,
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}
