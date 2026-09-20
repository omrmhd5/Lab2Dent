import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { defaultSession, getSessionOptions, type SessionData } from "./session";

export async function getSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  if (!session.isLoggedIn) {
    return { ...defaultSession };
  }

  return session;
}

export async function requireStaffSession() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireStaffSession();

  if (session.role !== "admin") {
    redirect("/admin");
  }

  return session;
}
