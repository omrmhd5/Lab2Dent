import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderFieldValues } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { readPaymentScreenshot } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; valueId: string }> },
) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id, valueId } = await params;
  const [value] = await db
    .select({
      imageKey: orderFieldValues.imageKey,
      type: orderFieldValues.type,
    })
    .from(orderFieldValues)
    .where(and(eq(orderFieldValues.id, valueId), eq(orderFieldValues.orderId, id)))
    .limit(1);

  if (!value || value.type !== "image" || !value.imageKey) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await readPaymentScreenshot(value.imageKey);

  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=60",
    },
  });
}
