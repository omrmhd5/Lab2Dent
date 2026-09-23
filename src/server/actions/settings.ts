"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import { getInstapayConfig } from "@/lib/settings";
import { normalizeInstapayLink } from "@/lib/instapay";

export async function getInstapaySettings() {
  return getInstapayConfig();
}

export async function updateInstapaySettings(formData: FormData) {
  await requireAdminSession();

  const linkRaw = String(formData.get("instapayLink") ?? "");
  const normalized = normalizeInstapayLink(linkRaw);

  if ("error" in normalized) {
    return { error: normalized.error };
  }

  const [existing] = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  if (existing) {
    await db
      .update(siteSettings)
      .set({
        instapayLink: normalized.link,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, 1));
  } else {
    await db.insert(siteSettings).values({
      id: 1,
      instapayLink: normalized.link,
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/new-case");
  return { ok: true as const };
}
