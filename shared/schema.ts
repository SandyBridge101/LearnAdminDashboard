import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  isVerified: boolean("is_verified").default(false),
  otpCode: text("otp_code"),
  otpExpiry: timestamp("otp_expiry"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tracks table
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: text("duration").notNull(),
  instructor: text("instructor").notNull(),
  imageUrl: text("image_url"),
  technologies: text("technologies").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  trackId: text("track_id").references(() => tracks.id).notNull(),
  instructor: text("instructor").notNull(),
  image: text("image").notNull(),
  duration: text("duration").notNull(),
  students: integer("students").default(0),
  status: text("status").default("active"), // active, draft, archived
  technologies: text("technologies").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learners table
export const learners = pgTable("learners", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  gender: text("gender"),
  location: text("location"),
  bio: text("bio"),
  trackId: integer("track_id").references(() => tracks.id),
  status: text("status").default("active"), // active, pending, inactive
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).default("0"),
  dateJoined: timestamp("date_joined").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  learnerId: integer("learner_id").references(() => learners.id).notNull(),
  trackId: integer("track_id").references(() => tracks.id),
  courseId: integer("course_id").references(() => courses.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, paid, overdue, cancelled
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const tracksRelations = relations(tracks, ({ many }) => ({
  courses: many(courses),
  learners: many(learners),
  invoices: many(invoices),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  track: one(tracks, {
    fields: [courses.trackId],
    references: [tracks.id],
  }),
  invoices: many(invoices),
}));

export const learnersRelations = relations(learners, ({ one, many }) => ({
  track: one(tracks, {
    fields: [learners.trackId],
    references: [tracks.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  learner: one(learners, {
    fields: [invoices.learnerId],
    references: [learners.id],
  }),
  track: one(tracks, {
    fields: [invoices.trackId],
    references: [tracks.id],
  }),
  course: one(courses, {
    fields: [invoices.courseId],
    references: [courses.id],
  }),
}));

// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).omit({ 
  id: true, 
  createdAt: true, 
  isVerified: true, 
  otpCode: true, 
  otpExpiry: true,
  resetToken: true,
  resetTokenExpiry: true 
});

export const insertTrackSchema = createInsertSchema(tracks).omit({ 
  id: true, 
  createdAt: true 
});

export const insertCourseSchema = createInsertSchema(courses).omit({ 
  id: true, 
  createdAt: true,
  students: true
});

export const insertLearnerSchema = createInsertSchema(learners).omit({ 
  id: true, 
  createdAt: true,
  dateJoined: true
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ 
  id: true, 
  createdAt: true,
  paidDate: true
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// OTP verification schema
export const otpVerificationSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

// Types
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Learner = typeof learners.$inferSelect;
export type InsertLearner = z.infer<typeof insertLearnerSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type OTPVerificationData = z.infer<typeof otpVerificationSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
