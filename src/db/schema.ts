import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const staffRoleEnum = pgEnum("staff_role", ["admin", "employee", "lab"]);

export const categoryFieldTypeEnum = pgEnum("category_field_type", [
  "text",
  "number",
  "image",
  "price",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "sent_to_lab",
  "in_lab",
  "ready",
  "delivered",
  "rejected",
]);

export const staff = pgTable(
  "staff",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: staffRoleEnum("role").notNull().default("employee"),
    universityId: uuid("university_id").references(() => universities.id, {
      onDelete: "set null",
    }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("staff_email_idx").on(table.email)],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").references((): AnyPgColumn => categories.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    nameAr: text("name_ar"),
    priceEgp: integer("price_egp"),
    costEgp: integer("cost_egp"),
    confirmedOrderCount: integer("confirmed_order_count").notNull().default(0),
    confirmedTotalPriceEgp: integer("confirmed_total_price_egp")
      .notNull()
      .default(0),
    confirmedTotalCostEgp: integer("confirmed_total_cost_egp")
      .notNull()
      .default(0),
    confirmedTotalProfitEgp: integer("confirmed_total_profit_egp")
      .notNull()
      .default(0),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("categories_parent_id_idx").on(table.parentId)],
);

export const universities = pgTable("universities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: serial("order_number").notNull(),
    code: text("code").notNull(),
    studentName: text("student_name").notNull(),
    studentPhone: text("student_phone").notNull(),
    studentUniversity: text("student_university").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    categoryName: text("category_name").notNull(),
    categoryNameAr: text("category_name_ar"),
    studentUniversityAr: text("student_university_ar"),
    priceEgp: integer("price_egp").notNull(),
    statsCostEgp: integer("stats_cost_egp"),
    statsProfitEgp: integer("stats_profit_egp"),
    shade: text("shade"),
    toothNotes: text("tooth_notes"),
    extraNotes: text("extra_notes"),
    status: orderStatusEnum("status").notNull().default("pending"),
    paymentScreenshotKey: text("payment_screenshot_key").notNull(),
    lastStatusByStaffId: uuid("last_status_by_staff_id").references(
      () => staff.id,
      { onDelete: "set null" },
    ),
    assignedLabId: uuid("assigned_lab_id").references(() => staff.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("orders_order_number_idx").on(table.orderNumber),
    uniqueIndex("orders_code_idx").on(table.code),
    index("orders_status_idx").on(table.status),
    index("orders_assigned_lab_id_idx").on(table.assignedLabId),
    index("orders_created_at_idx").on(table.createdAt),
  ],
);

export const categoryFields = pgTable(
  "category_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    labelAr: text("label_ar"),
    type: categoryFieldTypeEnum("type").notNull(),
    required: boolean("required").notNull().default(false),
    priceEgp: integer("price_egp"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("category_fields_category_id_idx").on(table.categoryId)],
);

export const orderFieldValues = pgTable(
  "order_field_values",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fieldId: uuid("field_id").references(() => categoryFields.id, {
      onDelete: "set null",
    }),
    label: text("label").notNull(),
    labelAr: text("label_ar"),
    type: categoryFieldTypeEnum("type").notNull(),
    textValue: text("text_value"),
    imageKey: text("image_key"),
    sortOrder: integer("sort_order").notNull().default(0),
    priceEgp: integer("price_egp"),
  },
  (table) => [index("order_field_values_order_id_idx").on(table.orderId)],
);

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  instapayLink: text("instapay_link").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatusEnum("status").notNull(),
    note: text("note"),
    staffId: uuid("staff_id").references(() => staff.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("order_events_order_id_idx").on(table.orderId)],
);

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type StaffRole = (typeof staffRoleEnum.enumValues)[number];
export type CategoryFieldType =
  (typeof categoryFieldTypeEnum.enumValues)[number];
