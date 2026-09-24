"use server";

import bcrypt from "bcryptjs";
import { and, asc, count, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  orderEvents,
  orders,
  staff,
  universities,
  type StaffRole,
} from "@/db/schema";
import { isCategoryGroup } from "@/lib/categories";
import { applyOrderStatusStatsTransition } from "@/lib/category-stats";
import { requireAdminSession } from "@/lib/auth";

const ROLES: StaffRole[] = ["admin", "employee", "lab"];

function parseRole(value: FormDataEntryValue | null): StaffRole | null {
  const role = String(value ?? "");
  return ROLES.includes(role as StaffRole) ? (role as StaffRole) : null;
}

function blankToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export async function listEmployees() {
  await requireAdminSession();

  const rows = await db
    .select({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      isActive: staff.isActive,
      universityId: staff.universityId,
      categoryId: staff.categoryId,
      universityName: universities.name,
      categoryName: categories.name,
      createdAt: staff.createdAt,
    })
    .from(staff)
    .leftJoin(universities, eq(staff.universityId, universities.id))
    .leftJoin(categories, eq(staff.categoryId, categories.id))
    .orderBy(asc(staff.createdAt));

  return rows;
}

async function assignmentFor(
  role: StaffRole,
  universityId: string | null,
  categoryId: string | null,
) {
  if (role === "admin") {
    return { universityId: null, categoryId: null };
  }

  if (role === "lab") {
    return { universityId: null, categoryId: null };
  }

  if (universityId) {
    const [university] = await db
      .select({ id: universities.id })
      .from(universities)
      .where(eq(universities.id, universityId))
      .limit(1);
    if (!university)
      return { error: "That university was not found." as const };
  }

  if (categoryId) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);
    if (!category || !isCategoryGroup(category)) {
      return { error: "Pick a parent category." as const };
    }
  }

  return { universityId, categoryId };
}

export async function createEmployee(formData: FormData) {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));

  if (!name || !email || !role || password.length < 8) {
    return {
      error:
        "Name, email, role, and a password of at least 8 characters are required.",
    };
  }

  const assignment = await assignmentFor(
    role,
    blankToNull(formData.get("universityId")),
    blankToNull(formData.get("categoryId")),
  );
  if ("error" in assignment) return { error: assignment.error };

  const [existing] = await db
    .select({ id: staff.id })
    .from(staff)
    .where(eq(staff.email, email))
    .limit(1);

  if (existing) {
    return { error: "That email is already in use." };
  }

  await db.insert(staff).values({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role,
    universityId: assignment.universityId,
    categoryId: assignment.categoryId,
    isActive: true,
  });

  revalidatePath("/dashboard/employees");
  return { ok: true as const };
}

export async function updateEmployee(formData: FormData) {
  await requireAdminSession();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (!id || !name || !email || !role) {
    return { error: "Name, email, and role are required." };
  }

  const [current] = await db
    .select({ role: staff.role, isActive: staff.isActive })
    .from(staff)
    .where(eq(staff.id, id))
    .limit(1);

  if (!current) return { error: "That account was not found." };

  const dropsLastAdmin =
    current.role === "admin" &&
    current.isActive &&
    (role !== "admin" || !isActive);

  if (dropsLastAdmin) {
    const [admins] = await db
      .select({ total: count() })
      .from(staff)
      .where(and(eq(staff.role, "admin"), eq(staff.isActive, true)));

    if ((admins?.total ?? 0) <= 1) {
      return {
        error: "Keep at least one active admin. Add another admin first.",
      };
    }
  }

  const assignment = await assignmentFor(
    role,
    blankToNull(formData.get("universityId")),
    blankToNull(formData.get("categoryId")),
  );
  if ("error" in assignment) return { error: assignment.error };

  const [other] = await db
    .select({ id: staff.id })
    .from(staff)
    .where(and(eq(staff.email, email), ne(staff.id, id)))
    .limit(1);

  if (other) {
    return { error: "That email is already in use." };
  }

  const patch: {
    name: string;
    email: string;
    role: StaffRole;
    isActive: boolean;
    universityId: string | null;
    categoryId: string | null;
    passwordHash?: string;
  } = {
    name,
    email,
    role,
    isActive,
    universityId: assignment.universityId,
    categoryId: assignment.categoryId,
  };

  if (password) {
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    patch.passwordHash = await bcrypt.hash(password, 12);
  }

  await db.update(staff).set(patch).where(eq(staff.id, id));
  revalidatePath("/dashboard/employees");
  return { ok: true as const };
}

export async function deleteEmployee(id: string) {
  const session = await requireAdminSession();

  if (!id) return { error: "Missing staff id." };

  if (id === session.staffId) {
    return { error: "You cannot delete your own account." };
  }

  const [member] = await db
    .select({ id: staff.id, role: staff.role })
    .from(staff)
    .where(eq(staff.id, id))
    .limit(1);

  if (!member) return { error: "That account was not found." };

  if (member.role === "admin") {
    const [admins] = await db
      .select({ total: count() })
      .from(staff)
      .where(eq(staff.role, "admin"));

    if ((admins?.total ?? 0) <= 1) {
      return { error: "Keep at least one admin account." };
    }
  }

  await db.transaction(async (tx) => {
    const assignedOrders = await tx
      .select({
        id: orders.id,
        status: orders.status,
        categoryId: orders.categoryId,
        priceEgp: orders.priceEgp,
        statsCostEgp: orders.statsCostEgp,
        statsProfitEgp: orders.statsProfitEgp,
      })
      .from(orders)
      .where(eq(orders.assignedLabId, id));

    const nextStatus = "confirmed" as const;

    for (const order of assignedOrders) {
      if (order.status !== nextStatus) {
        await applyOrderStatusStatsTransition(
          tx,
          order,
          order.status,
          nextStatus,
        );
      }

      await tx
        .update(orders)
        .set({
          status: nextStatus,
          assignedLabId: null,
          lastStatusByStaffId: session.staffId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      if (order.status !== nextStatus) {
        await tx.insert(orderEvents).values({
          orderId: order.id,
          status: nextStatus,
          note: "Assigned lab removed",
          staffId: session.staffId,
        });
      }
    }

    await tx.delete(staff).where(eq(staff.id, id));
  });

  revalidatePath("/dashboard/employees");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
