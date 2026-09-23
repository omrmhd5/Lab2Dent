import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import type { InstapayConfig } from "@/lib/instapay";

export async function getInstapayConfig(): Promise<InstapayConfig> {
  try {
    const [row] = await db
      .select({ link: siteSettings.instapayLink })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);

    if (row?.link) {
      return { link: row.link };
    }
  } catch {
    // Table may not exist yet before db:push.
  }

  return { link: "" };
}
