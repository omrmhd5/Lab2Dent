"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { apiError } from "@/i18n/api";
import { getSessionOptions, type SessionData } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export async function loginStaff(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: await apiError("emailPasswordRequired") };
  }

  const [member] = await db
    .select()
    .from(staff)
    .where(eq(staff.email, email))
    .limit(1);

  if (!member || !member.isActive) {
    return { error: await apiError("invalidCredentials") };
  }

  const isValid = await bcrypt.compare(password, member.passwordHash);

  if (!isValid) {
    return { error: await apiError("invalidCredentials") };
  }

  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  session.staffId = member.id;
  session.name = member.name;
  session.email = member.email;
  session.role = member.role;
  session.isLoggedIn = true;
  await session.save();

  const from = String(formData.get("from") ?? "").trim();
  redirect(from.startsWith("/dashboard") ? from : "/dashboard");
}

export async function logoutStaff() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  session.destroy();
  redirect("/login");
}
