import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, orders } from "@/db/schema";
import { getLiveStaffSession } from "@/lib/auth";
import { loadOrderScope } from "@/lib/order-scope";
import { readPaymentScreenshot } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getLiveStaffSession();

  if (!session || session.role === "lab") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const scope = await loadOrderScope(session.staffId);
  if (!scope) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const [order] = await db
    .select({ paymentScreenshotKey: orders.paymentScreenshotKey })
    .from(orders)
    .leftJoin(categories, eq(orders.categoryId, categories.id))
    .where(and(eq(orders.id, id), scope.condition))
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
