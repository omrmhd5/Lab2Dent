import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { readPaymentScreenshot } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const [order] = await db
    .select({ paymentScreenshotKey: orders.paymentScreenshotKey })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await readPaymentScreenshot(order.paymentScreenshotKey);

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
