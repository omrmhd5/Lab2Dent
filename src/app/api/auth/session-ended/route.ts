import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionOptions, type SessionData } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    getSessionOptions(),
  );
  await session.destroy();

  return NextResponse.redirect(new URL("/login", request.url));
}
