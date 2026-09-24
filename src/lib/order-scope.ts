import { and, eq, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  orders,
  staff,
  universities,
  type StaffRole,
} from "@/db/schema";

export type OrderScope = {
  role: StaffRole;
  condition: SQL | undefined;
};

export async function loadOrderScope(
  staffId: string,
): Promise<OrderScope | null> {
  const [member] = await db
    .select({
      role: staff.role,
      universityId: staff.universityId,
      categoryId: staff.categoryId,
    })
    .from(staff)
    .where(eq(staff.id, staffId))
    .limit(1);

  if (!member) return null;
  if (member.role === "admin") {
    return { role: "admin", condition: undefined };
  }

  const categoryMatch = member.categoryId
    ? or(
        eq(categories.parentId, member.categoryId),
        eq(orders.categoryId, member.categoryId),
      )
    : undefined;

  if (member.role === "lab") {
    return {
      role: "lab",
      condition: eq(orders.assignedLabId, staffId),
    };
  }

  const parts: SQL[] = [];

  if (member.universityId) {
    const [university] = await db
      .select({ name: universities.name })
      .from(universities)
      .where(eq(universities.id, member.universityId))
      .limit(1);
    if (!university) return { role: "employee", condition: sql`false` };
    parts.push(eq(orders.studentUniversity, university.name));
  }

  if (categoryMatch) parts.push(categoryMatch);
  if (parts.length === 0) return { role: "employee", condition: undefined };

  return { role: "employee", condition: and(...parts) };
}
