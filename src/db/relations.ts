import { relations } from "drizzle-orm";
import {
  categories,
  customers,
  orderEvents,
  orders,
  staff,
} from "./schema";

export const categoriesRelations = relations(categories, ({ many }) => ({
  orders: many(orders),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  category: one(categories, {
    fields: [orders.categoryId],
    references: [categories.id],
  }),
  lastStatusBy: one(staff, {
    fields: [orders.lastStatusByStaffId],
    references: [staff.id],
  }),
  events: many(orderEvents),
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
  updatedOrders: many(orders),
}));
