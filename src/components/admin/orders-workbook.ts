import type { OrderStatus, StaffRole } from "@/db/schema";
import { statusLabel } from "@/lib/status";
import { formatDateTime } from "@/lib/utils";

export type ExportableOrder = {
  orderNumber: number;
  code: string;
  studentName: string;
  studentPhone: string;
  studentUniversity: string;
  categoryName: string;
  priceEgp: number;
  costEgp: number | null;
  status: OrderStatus;
  assignedLabName?: string | null;
};

const BRAND = "FF0E7490";
const INK = "FF134E4A";
const WHITE = "FFFFFFFF";
const SOFT = "FFECFEFF";
const LINE = "FFA8D4D8";
const MONEY = "FF134E4A";

const STATUS_FILL: Record<OrderStatus, { fill: string; ink: string }> = {
  pending: { fill: "FFFEF3C7", ink: "FF92400E" },
  confirmed: { fill: "FFD1FAE5", ink: "FF065F46" },
  sent_to_lab: { fill: "FFEDE9FE", ink: "FF5B21B6" },
  in_lab: { fill: "FFEDE9FE", ink: "FF5B21B6" },
  ready: { fill: "FFD1FAE5", ink: "FF047857" },
  delivered: { fill: "FFD1FAE5", ink: "FF047857" },
  rejected: { fill: "FFFEE2E2", ink: "FFB91C1C" },
};

type Column = {
  header: string;
  width: number;
  money?: boolean;
  value: (order: ExportableOrder) => string | number;
};

function columnsFor(role: StaffRole): Column[] {
  const showPrice = role !== "lab";
  const showMoney = role === "admin";
  const columns: Column[] = [
    { header: "No.", width: 8, value: (order) => order.orderNumber },
    { header: "Code", width: 16, value: (order) => order.code },
    { header: "Student", width: 22, value: (order) => order.studentName },
    { header: "Phone", width: 16, value: (order) => order.studentPhone },
    {
      header: "University",
      width: 28,
      value: (order) => order.studentUniversity,
    },
    { header: "Work", width: 22, value: (order) => order.categoryName },
  ];
  if (showPrice) {
    columns.push({
      header: "Price",
      width: 12,
      money: true,
      value: (order) => order.priceEgp,
    });
  }
  if (showMoney) {
    columns.push(
      {
        header: "Cost",
        width: 12,
        money: true,
        value: (order) => order.costEgp ?? "",
      },
      {
        header: "Profit",
        width: 12,
        money: true,
        value: (order) =>
          order.costEgp === null ? "" : order.priceEgp - order.costEgp,
      },
    );
  }
  columns.push({
    header: "Status",
    width: 28,
    value: (order) => statusLabel(order.status, "en", order.assignedLabName),
  });
  return columns;
}

export async function downloadOrdersWorkbook(
  orders: ExportableOrder[],
  role: StaffRole,
) {
  const ExcelJS = (await import("exceljs")).default;
  const columns = columnsFor(role);
  const lastCol = columns.length;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Lab2Dent";
  const sheet = workbook.addWorksheet("Orders", {
    views: [{ state: "frozen", ySplit: 3, showGridLines: false }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
    },
  });

  sheet.columns = columns.map((column) => ({ width: column.width }));

  sheet.mergeCells(1, 1, 1, lastCol);
  const title = sheet.getCell(1, 1);
  title.value = "Lab2Dent orders";
  title.font = {
    name: "Calibri",
    size: 18,
    bold: true,
    color: { argb: WHITE },
  };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
  title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(1).height = 32;

  sheet.mergeCells(2, 1, 2, lastCol);
  const subtitle = sheet.getCell(2, 1);
  subtitle.value = `Exported ${formatDateTime(new Date())}  ·  ${orders.length} order${orders.length === 1 ? "" : "s"}`;
  subtitle.font = { name: "Calibri", size: 11, color: { argb: INK } };
  subtitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: SOFT },
  };
  subtitle.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(2).height = 22;

  const header = sheet.getRow(3);
  header.height = 22;
  columns.forEach((column, index) => {
    const cell = header.getCell(index + 1);
    cell.value = column.header;
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: WHITE },
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INK } };
    cell.alignment = {
      vertical: "middle",
      horizontal: column.money ? "right" : "left",
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: BRAND } },
    };
  });

  orders.forEach((order, rowIndex) => {
    const row = sheet.getRow(rowIndex + 4);
    row.height = 20;
    const zebra = rowIndex % 2 === 1;
    columns.forEach((column, index) => {
      const cell = row.getCell(index + 1);
      cell.value = column.value(order);
      cell.font = {
        name: "Calibri",
        size: 11,
        color: { argb: column.money ? MONEY : INK },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: column.money ? "right" : "left",
      };
      cell.border = {
        bottom: { style: "thin", color: { argb: LINE } },
      };
      if (zebra) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: SOFT },
        };
      }
      if (column.money && typeof cell.value === "number") {
        cell.numFmt = '#,##0" EGP"';
      }
      if (column.header === "Status") {
        const tone = STATUS_FILL[order.status];
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: tone.fill },
        };
        cell.font = {
          name: "Calibri",
          size: 11,
          bold: true,
          color: { argb: tone.ink },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
    });
  });

  sheet.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3 + Math.max(orders.length, 1), column: lastCol },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lab2dent-orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
