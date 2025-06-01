import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const userRoleEnum = pgEnum("user_role", ["user", "caterer", "admin"]);

// Enum for order status
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]);

// Enum for meal types
export const mealTypeEnum = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snacks", "full_day"]);

// Enum for event types
export const eventTypeEnum = pgEnum("event_type", ["wedding", "corporate", "pooja", "party", "other"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
});

// Caterers table
export const caterers = pgTable("caterers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  minPlate: integer("min_plate").notNull(),
  maxPlate: integer("max_plate").notNull(),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
  specialties: text("specialties").array(),
  eventTypes: eventTypeEnum("event_types").array(),
});

// Menus table
export const menus = pgTable("menus", {
  id: serial("id").primaryKey(),
  catererId: integer("caterer_id").notNull().references(() => caterers.id),
  name: text("name").notNull(),
  mealType: mealTypeEnum("meal_type").notNull(),
  pricePerPlate: integer("price_per_plate").notNull(),
  description: text("description"),
  items: text("items").array().notNull(),
  isVegetarian: boolean("is_vegetarian").default(false),
  isSpecial: boolean("is_special").default(false),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  catererId: integer("caterer_id").notNull().references(() => caterers.id),
  menuId: integer("menu_id").notNull().references(() => menus.id),
  eventType: eventTypeEnum("event_type").notNull(),
  noOfPlates: integer("no_of_plates").notNull(),
  totalPrice: integer("total_price").notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventTime: text("event_time").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  specialInstructions: text("special_instructions"),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  catererId: integer("caterer_id").notNull().references(() => caterers.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCatererSchema = createInsertSchema(caterers).omit({ id: true });
export const insertMenuSchema = createInsertSchema(menus).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCaterer = z.infer<typeof insertCatererSchema>;
export type Caterer = typeof caterers.$inferSelect;

export type InsertMenu = z.infer<typeof insertMenuSchema>;
export type Menu = typeof menus.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Create extended schemas for frontend validation
export const userRegisterSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const catererRegisterSchema = insertCatererSchema.extend({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  email: z.string().email(),
  username: z.string().min(3),
  name: z.string().min(2),
  phone: z.string().min(10),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
