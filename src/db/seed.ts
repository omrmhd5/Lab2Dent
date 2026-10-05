import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { put } from "@vercel/blob";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDirectDatabaseUrl } from "../lib/db-url";
import { deleteStoredImages } from "../lib/storage";
import {
  categories,
  categoryFields,
  orderEvents,
  orderFieldValues,
  orders,
  siteSettings,
  staff,
  universities,
} from "./schema";

const fixturesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
);

const sampleUniversities = [
  { name: "Cairo University", nameAr: "جامعة القاهرة", sortOrder: 0 },
  { name: "Ain Shams University", nameAr: "جامعة عين شمس", sortOrder: 1 },
  { name: "Alexandria University", nameAr: "جامعة الإسكندرية", sortOrder: 2 },
  { name: "Mansoura University", nameAr: "جامعة المنصورة", sortOrder: 3 },
  { name: "Tanta University", nameAr: "جامعة طنطا", sortOrder: 4 },
];

async function storeShot(name: string) {
  const bytes = await readFile(path.join(fixturesDir, name));
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const useBlob = Boolean(token || process.env.BLOB_STORE_ID);

  if (useBlob) {
    const blob = await put(`payments/${name}`, bytes, {
      access: "private",
      contentType: "image/png",
      addRandomSuffix: false,
      ...(token ? { token } : {}),
    });
    return `blob:${blob.pathname}`;
  }

  const { mkdir, writeFile } = await import("node:fs/promises");
  const relative = `payments/${name}`;
  const diskPath = path.join(process.cwd(), ".data", "uploads", relative);
  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, bytes);
  return `local:${relative}`;
}

async function seed() {
  const url = getDirectDatabaseUrl();
  const client = postgres(url, { max: 1, ssl: "require" });
  const db = drizzle(client);

  try {
    const existingShots = await db
      .select({ key: orders.paymentScreenshotKey })
      .from(orders);
    const existingFields = await db
      .select({ key: orderFieldValues.imageKey })
      .from(orderFieldValues);
    await deleteStoredImages([
      ...existingShots.map((row) => row.key),
      ...existingFields.map((row) => row.key),
    ]);

    await db.delete(orderFieldValues);
    await db.delete(orderEvents);
    await db.delete(orders);
    await db.delete(categoryFields);
    await db.delete(categories);
    await db.delete(staff);
    await db.delete(universities);

    await db
      .insert(universities)
      .values(sampleUniversities);

    await db
      .insert(siteSettings)
      .values({ id: 1, instapayLink: "tel:01000000000" })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { instapayLink: "tel:01000000000", updatedAt: new Date() },
      });

    const [crowns] = await db
      .insert(categories)
      .values({
        name: "Crowns & Bridges",
        nameAr: "تيجان وجسور",
        sortOrder: 0,
        confirmedOrderCount: 0,
      })
      .returning({ id: categories.id });
    const [removable] = await db
      .insert(categories)
      .values({
        name: "Removable",
        nameAr: "أجهزة متحركة",
        sortOrder: 1,
        confirmedOrderCount: 1,
        confirmedTotalPriceEgp: 3900,
        confirmedTotalCostEgp: 1550,
        confirmedTotalProfitEgp: 2350,
      })
      .returning({ id: categories.id });
    const [ortho] = await db
      .insert(categories)
      .values({
        name: "Orthodontics",
        nameAr: "تقويم",
        sortOrder: 2,
        confirmedOrderCount: 1,
        confirmedTotalPriceEgp: 1900,
        confirmedTotalCostEgp: 740,
        confirmedTotalProfitEgp: 1160,
      })
      .returning({ id: categories.id });

    const [zirconia] = await db
      .insert(categories)
      .values({
        parentId: crowns.id,
        name: "Zirconia Crown",
        nameAr: "تاج زيركون",
        priceEgp: 1500,
        costEgp: 700,
        sortOrder: 0,
      })
      .returning({ id: categories.id });
    const [bridge] = await db
      .insert(categories)
      .values({
        parentId: crowns.id,
        name: "PFM Bridge",
        nameAr: "جسر بورسلين",
        priceEgp: 1200,
        costEgp: 550,
        sortOrder: 1,
      })
      .returning({ id: categories.id });
    const [denture] = await db
      .insert(categories)
      .values({
        parentId: removable.id,
        name: "Complete Denture",
        nameAr: "طقم كامل",
        priceEgp: 3500,
        costEgp: 1400,
        sortOrder: 0,
      })
      .returning({ id: categories.id });
    const [partial] = await db
      .insert(categories)
      .values({
        parentId: removable.id,
        name: "Partial Denture",
        nameAr: "طقم جزئي",
        priceEgp: 2800,
        costEgp: 1100,
        sortOrder: 1,
      })
      .returning({ id: categories.id });
    const [hawley] = await db
      .insert(categories)
      .values({
        parentId: ortho.id,
        name: "Hawley Retainer",
        nameAr: "حافظ هاولي",
        priceEgp: 1800,
        costEgp: 700,
        sortOrder: 0,
      })
      .returning({ id: categories.id });
    const [aligner] = await db
      .insert(categories)
      .values({
        parentId: ortho.id,
        name: "Clear Aligner",
        nameAr: "تقويم شفاف",
        priceEgp: 4500,
        costEgp: 2000,
        sortOrder: 1,
      })
      .returning({ id: categories.id });

    const shade = {
      categoryId: zirconia.id,
      label: "Shade",
      labelAr: "درجة اللون",
      type: "text" as const,
      required: true,
      sortOrder: 0,
    };
    const tooth = {
      categoryId: zirconia.id,
      label: "Tooth",
      labelAr: "رقم السن",
      type: "text" as const,
      required: true,
      sortOrder: 1,
    };
    const tempCrown = {
      categoryId: zirconia.id,
      label: "Temporary crown",
      labelAr: "تاج مؤقت",
      type: "price" as const,
      required: false,
      priceEgp: 200,
      costEgp: 80,
      sortOrder: 2,
    };
    const units = {
      categoryId: bridge.id,
      label: "Units",
      labelAr: "عدد الوحدات",
      type: "number" as const,
      required: true,
      sortOrder: 0,
    };
    const tryIn = {
      categoryId: bridge.id,
      label: "Metal try-in",
      labelAr: "تجربة معدنية",
      type: "price" as const,
      required: false,
      priceEgp: 150,
      costEgp: 60,
      sortOrder: 1,
    };
    const archDenture = {
      categoryId: denture.id,
      label: "Arch",
      labelAr: "الفك",
      type: "text" as const,
      required: true,
      sortOrder: 0,
    };
    const liner = {
      categoryId: denture.id,
      label: "Soft liner",
      labelAr: "بطانة لينة",
      type: "price" as const,
      required: false,
      priceEgp: 400,
      costEgp: 150,
      sortOrder: 1,
    };
    const partialNotes = {
      categoryId: partial.id,
      label: "Missing teeth",
      labelAr: "الأسنان المفقودة",
      type: "text" as const,
      required: false,
      sortOrder: 0,
    };
    const clasps = {
      categoryId: partial.id,
      label: "Extra clasps",
      labelAr: "مشابك إضافية",
      type: "price" as const,
      required: false,
      priceEgp: 250,
      costEgp: 90,
      sortOrder: 1,
    };
    const archHawley = {
      categoryId: hawley.id,
      label: "Arch",
      labelAr: "الفك",
      type: "text" as const,
      required: true,
      sortOrder: 0,
    };
    const color = {
      categoryId: hawley.id,
      label: "Colored acrylic",
      labelAr: "أكريل ملون",
      type: "price" as const,
      required: false,
      priceEgp: 100,
      costEgp: 40,
      sortOrder: 1,
    };
    const stages = {
      categoryId: aligner.id,
      label: "Stages",
      labelAr: "عدد المراحل",
      type: "number" as const,
      required: false,
      sortOrder: 0,
    };
    const refinement = {
      categoryId: aligner.id,
      label: "Refinement",
      labelAr: "تعديل إضافي",
      type: "price" as const,
      required: false,
      priceEgp: 800,
      costEgp: 300,
      sortOrder: 1,
    };

    const insertedFields = await db
      .insert(categoryFields)
      .values([
        shade,
        tooth,
        tempCrown,
        units,
        tryIn,
        archDenture,
        liner,
        partialNotes,
        clasps,
        archHawley,
        color,
        stages,
        refinement,
      ])
      .returning({
        id: categoryFields.id,
        label: categoryFields.label,
        categoryId: categoryFields.categoryId,
      });

    function fieldId(categoryId: string, label: string) {
      const row = insertedFields.find(
        (item) => item.categoryId === categoryId && item.label === label,
      );
      if (!row) throw new Error(`Missing field ${label}`);
      return row.id;
    }

    const passwordHash = async (password: string) => bcrypt.hash(password, 12);
    const [admin, employee, lab] = await db
      .insert(staff)
      .values([
        {
          name: "Admin",
          email: "admin@admin.com",
          passwordHash: await passwordHash("admin123"),
          role: "admin",
        },
        {
          name: "Employee",
          email: "employee@employee.com",
          passwordHash: await passwordHash("employee123"),
          role: "employee",
        },
        {
          name: "Lab",
          email: "lab@lab.com",
          passwordHash: await passwordHash("lab123"),
          role: "lab",
        },
      ])
      .returning({ id: staff.id, role: staff.role });

    const adminId = admin.id;
    const labId = lab.id;
    void employee;

    const shot1700 = await storeShot("instapay-1700.png");
    const shot3900 = await storeShot("instapay-3900.png");
    const shot1900 = await storeShot("instapay-1900.png");

    const [orderPending] = await db
      .insert(orders)
      .values({
        code: "L2D-DEMOA2",
        studentName: "Mariam Hassan",
        studentPhone: "01011111111",
        studentUniversity: "Cairo University",
        studentUniversityAr: "جامعة القاهرة",
        categoryId: zirconia.id,
        categoryName: "Zirconia Crown",
        categoryNameAr: "تاج زيركون",
        priceEgp: 1700,
        shade: "A2",
        toothNotes: "11",
        status: "pending",
        paymentScreenshotKey: shot1700,
      })
      .returning({ id: orders.id });

    const [orderConfirmed] = await db
      .insert(orders)
      .values({
        code: "L2D-DEMOB3",
        studentName: "Youssef Adel",
        studentPhone: "01022222222",
        studentUniversity: "Ain Shams University",
        studentUniversityAr: "جامعة عين شمس",
        categoryId: denture.id,
        categoryName: "Complete Denture",
        categoryNameAr: "طقم كامل",
        priceEgp: 3900,
        statsCostEgp: 1550,
        statsProfitEgp: 2350,
        status: "confirmed",
        paymentScreenshotKey: shot3900,
        lastStatusByStaffId: adminId,
      })
      .returning({ id: orders.id });

    const [orderLab] = await db
      .insert(orders)
      .values({
        code: "L2D-DEMOC4",
        studentName: "Nour Samir",
        studentPhone: "01033333333",
        studentUniversity: "Alexandria University",
        studentUniversityAr: "جامعة الإسكندرية",
        categoryId: hawley.id,
        categoryName: "Hawley Retainer",
        categoryNameAr: "حافظ هاولي",
        priceEgp: 1900,
        statsCostEgp: 740,
        statsProfitEgp: 1160,
        status: "sent_to_lab",
        paymentScreenshotKey: shot1900,
        assignedLabId: labId,
        lastStatusByStaffId: adminId,
      })
      .returning({ id: orders.id });

    await db.insert(orderFieldValues).values([
      {
        orderId: orderPending.id,
        fieldId: fieldId(zirconia.id, "Shade"),
        label: "Shade",
        labelAr: "درجة اللون",
        type: "text",
        textValue: "A2",
        sortOrder: 0,
      },
      {
        orderId: orderPending.id,
        fieldId: fieldId(zirconia.id, "Tooth"),
        label: "Tooth",
        labelAr: "رقم السن",
        type: "text",
        textValue: "11",
        sortOrder: 1,
      },
      {
        orderId: orderPending.id,
        fieldId: fieldId(zirconia.id, "Temporary crown"),
        label: "Temporary crown",
        labelAr: "تاج مؤقت",
        type: "price",
        textValue: "200 EGP",
        priceEgp: 200,
        costEgp: 80,
        sortOrder: 2,
      },
      {
        orderId: orderConfirmed.id,
        fieldId: fieldId(denture.id, "Arch"),
        label: "Arch",
        labelAr: "الفك",
        type: "text",
        textValue: "Upper",
        sortOrder: 0,
      },
      {
        orderId: orderConfirmed.id,
        fieldId: fieldId(denture.id, "Soft liner"),
        label: "Soft liner",
        labelAr: "بطانة لينة",
        type: "price",
        textValue: "400 EGP",
        priceEgp: 400,
        costEgp: 150,
        sortOrder: 1,
      },
      {
        orderId: orderLab.id,
        fieldId: fieldId(hawley.id, "Arch"),
        label: "Arch",
        labelAr: "الفك",
        type: "text",
        textValue: "Upper",
        sortOrder: 0,
      },
      {
        orderId: orderLab.id,
        fieldId: fieldId(hawley.id, "Colored acrylic"),
        label: "Colored acrylic",
        labelAr: "أكريل ملون",
        type: "price",
        textValue: "100 EGP",
        priceEgp: 100,
        costEgp: 40,
        sortOrder: 1,
      },
    ]);

    await db.insert(orderEvents).values([
      { orderId: orderPending.id, status: "pending", staffId: null },
      { orderId: orderConfirmed.id, status: "pending", staffId: null },
      {
        orderId: orderConfirmed.id,
        status: "confirmed",
        staffId: adminId,
      },
      { orderId: orderLab.id, status: "pending", staffId: null },
      {
        orderId: orderLab.id,
        status: "confirmed",
        staffId: adminId,
      },
      {
        orderId: orderLab.id,
        status: "sent_to_lab",
        staffId: adminId,
        note: "Assigned to lab",
      },
    ]);

    console.log("Demo seed complete.");
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
