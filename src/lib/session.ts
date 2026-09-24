import type { SessionOptions } from "iron-session";

export interface SessionData {
  staffId: string;
  name: string;
  email: string;
  role: "admin" | "employee" | "lab";
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  staffId: "",
  name: "",
  email: "",
  role: "employee",
  isLoggedIn: false,
};

function getSessionPassword() {
  const secret = process.env.SESSION_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "development") {
    return "dev-session-secret-must-be-32-chars-min";
  }

  throw new Error("SESSION_SECRET must be at least 32 characters.");
}

/** Staff sign-in stays valid for one hour (refreshed while the dashboard is in use). */
export const STAFF_SESSION_MAX_AGE = 60 * 60;

export function getSessionOptions(): SessionOptions {
  return {
    password: getSessionPassword(),
    cookieName: "lab2dent-session",
    ttl: STAFF_SESSION_MAX_AGE,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: STAFF_SESSION_MAX_AGE,
    },
  };
}
