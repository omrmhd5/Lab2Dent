import { NextResponse } from "next/server";
import { apiError } from "@/i18n/api";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderFieldValues } from "@/db/schema";
import { getLiveStaffSession } from "@/lib/auth";
import { readPaymentScreenshot } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; valueId: string }> },
) {
  const session = await getLiveStaffSession();

  if (!session) {
    return new NextResponse(await apiError("unauthorized"), { status: 401 });
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
    return new NextResponse(await apiError("notFound"), { status: 404 });
  }

  const file = await readPaymentScreenshot(value.imageKey);

  if (!file) {
    return new NextResponse(await apiError("notFound"), { status: 404 });
  }

  return new NextResponse(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=60",
    },
  });
}
