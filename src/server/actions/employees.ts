"use server";

import bcrypt from "bcryptjs";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { requireAdminSession, requireStaffSession } from "@/lib/auth";

export async function listCustomers() {
  await requireStaffSession();

  const rows = await db.query.customers.findMany({
    columns: {
      id: true,
      name: true,
      phone: true,
      university: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      orders: {
        columns: { id: true, createdAt: true },
      },
    },
    orderBy: (row, { desc }) => [desc(row.updatedAt)],
  });

  return rows;
}

export async function listEmployees() {
  await requireAdminSession();
  return db
    .select({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      isActive: staff.isActive,
      createdAt: staff.createdAt,
    })
    .from(staff)
    .orderBy(staff.createdAt);
}

export async function createEmployee(formData: FormData) {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role =
    String(formData.get("role") ?? "employee") === "admin"
      ? "admin"
      : "employee";

  if (!name || !email || password.length < 8) {
    return {
      error:
        "Name, email, and a password of at least 8 characters are required.",
    };
  }

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
    isActive: true,
  });

  revalidatePath("/admin/employees");
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
  const role =
    String(formData.get("role") ?? "employee") === "admin"
      ? "admin"
      : "employee";
  const isActive = String(formData.get("isActive") ?? "") === "on";

  if (!id || !name || !email) {
    return { error: "Name and email are required." };
  }

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
    role: "admin" | "employee";
    isActive: boolean;
    passwordHash?: string;
  } = { name, email, role, isActive };

  if (password) {
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    patch.passwordHash = await bcrypt.hash(password, 12);
  }

  await db.update(staff).set(patch).where(eq(staff.id, id));
  revalidatePath("/admin/employees");
  return { ok: true as const };
}
