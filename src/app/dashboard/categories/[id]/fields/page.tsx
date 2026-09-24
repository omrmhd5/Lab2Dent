import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdminSession } from "@/lib/auth";
import { isCategoryGroup, type CategoryRecord } from "@/lib/categories";

export default async function LegacyFieldsRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!row) notFound();

  if (isCategoryGroup(row as CategoryRecord)) {
    redirect(`/dashboard/categories/${row.id}`);
  }

  if (row.parentId) {
    redirect(`/dashboard/categories/${row.parentId}#${row.id}`);
  }

  notFound();
}
