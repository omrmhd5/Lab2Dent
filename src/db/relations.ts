import { relations } from "drizzle-orm";
import {
  categories,
  categoryFields,
  orderEvents,
  orderFieldValues,
  orders,
  staff,
} from "./schema";

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_children",
  }),
  children: many(categories, { relationName: "category_children" }),
  orders: many(orders),
  fields: many(categoryFields),
}));

export const categoryFieldsRelations = relations(categoryFields, ({ one, many }) => ({
  category: one(categories, {
    fields: [categoryFields.categoryId],
    references: [categories.id],
  }),
  values: many(orderFieldValues),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  category: one(categories, {
    fields: [orders.categoryId],
    references: [categories.id],
  }),
  lastStatusBy: one(staff, {
    fields: [orders.lastStatusByStaffId],
    references: [staff.id],
    relationName: "order_status_staff",
  }),
  assignedLab: one(staff, {
    fields: [orders.assignedLabId],
    references: [staff.id],
    relationName: "order_assigned_lab",
  }),
  events: many(orderEvents),
  fieldValues: many(orderFieldValues),
}));

export const orderFieldValuesRelations = relations(orderFieldValues, ({ one }) => ({
  order: one(orders, {
    fields: [orderFieldValues.orderId],
    references: [orders.id],
  }),
  field: one(categoryFields, {
    fields: [orderFieldValues.fieldId],
    references: [categoryFields.id],
  }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderEvents.orderId],
    references: [orders.id],
  }),
  staff: one(staff, {
    fields: [orderEvents.staffId],
    references: [staff.id],
  }),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  events: many(orderEvents),
  updatedOrders: many(orders, { relationName: "order_status_staff" }),
  assignedOrders: many(orders, { relationName: "order_assigned_lab" }),
}));
