import { eq } from "drizzle-orm";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { staff, type StaffRole } from "@/db/schema";
import { defaultSession, getSessionOptions, type SessionData } from "./session";

export type StaffSession = SessionData & {
  isLoggedIn: true;
  staffId: string;
  role: StaffRole;
};

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

async function loadLiveStaff(staffId: string) {
  const [member] = await db
    .select({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      isActive: staff.isActive,
    })
    .from(staff)
    .where(eq(staff.id, staffId))
    .limit(1);

  if (!member?.isActive) return null;
  return member;
}

/** Logged-in session whose staff row still exists and is active. Clears the cookie otherwise. */
export async function getLiveStaffSession(): Promise<StaffSession | null> {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );

  if (!session.isLoggedIn || !session.staffId || !session.role) {
    return null;
  }

  const member = await loadLiveStaff(session.staffId);
  if (!member) return null;

  return {
    isLoggedIn: true,
    staffId: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
  };
}

export async function requireStaffSession(): Promise<StaffSession> {
  const cookieSession = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );
  const session = await getLiveStaffSession();

  if (!session) {
    redirect(cookieSession.isLoggedIn ? "/api/auth/session-ended" : "/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireStaffSession();

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}
