import { 
  admins, tracks, courses, learners, invoices,
  type Admin, type InsertAdmin, type Track, type InsertTrack,
  type Course, type InsertCourse, type Learner, type InsertLearner,
  type Invoice, type InsertInvoice
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface IStorage {
  // Admin methods
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminById(id: number): Promise<Admin | undefined>;
  updateAdmin(id: number, updates: Partial<Admin>): Promise<Admin | undefined>;
  verifyAdminPassword(email: string, password: string): Promise<Admin | undefined>;
  
  // Track methods
  createTrack(track: InsertTrack): Promise<Track>;
  getTracks(search?: string): Promise<Track[]>;
  getTrackById(id: number): Promise<Track | undefined>;
  updateTrack(id: number, updates: Partial<Track>): Promise<Track | undefined>;
  deleteTrack(id: number): Promise<boolean>;
  
  // Course methods
  createCourse(course: InsertCourse): Promise<Course>;
  getCourses(search?: string, trackId?: number): Promise<Course[]>;
  getCourseById(id: number): Promise<Course | undefined>;
  updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // Learner methods
  createLearner(learner: InsertLearner): Promise<Learner>;
  getLearners(search?: string, trackId?: number): Promise<Learner[]>;
  getLearnerById(id: number): Promise<Learner | undefined>;
  updateLearner(id: number, updates: Partial<Learner>): Promise<Learner | undefined>;
  deleteLearner(id: number): Promise<boolean>;
  
  // Invoice methods
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoices(search?: string, status?: string): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Dashboard analytics
  getDashboardStats(): Promise<{
    totalLearners: number;
    totalRevenue: number;
    activeCourses: number;
    pendingInvoices: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Admin methods
  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(insertAdmin.password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const [admin] = await db
      .insert(admins)
      .values({
        ...insertAdmin,
        password: hashedPassword,
        otpCode,
        otpExpiry,
      })
      .returning();
    return admin;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async getAdminById(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin || undefined;
  }

  async updateAdmin(id: number, updates: Partial<Admin>): Promise<Admin | undefined> {
    const [admin] = await db
      .update(admins)
      .set(updates)
      .where(eq(admins.id, id))
      .returning();
    return admin || undefined;
  }

  async verifyAdminPassword(email: string, password: string): Promise<Admin | undefined> {
    const admin = await this.getAdminByEmail(email);
    if (!admin) return undefined;

    const isValid = await bcrypt.compare(password, admin.password);
    return isValid ? admin : undefined;
  }

  // Track methods
  async createTrack(track: InsertTrack): Promise<Track> {
    const [newTrack] = await db.insert(tracks).values(track).returning();
    return newTrack;
  }

  async getTracks(search?: string): Promise<Track[]> {
    let query = db.select().from(tracks);
    
    if (search) {
      query = query.where(
        or(
          ilike(tracks.name, `%${search}%`),
          ilike(tracks.instructor, `%${search}%`)
        )
      );
    }
    
    return query.orderBy(desc(tracks.createdAt));
  }

  async getTrackById(id: number): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
    return track || undefined;
  }

  async updateTrack(id: number, updates: Partial<Track>): Promise<Track | undefined> {
    const [track] = await db
      .update(tracks)
      .set(updates)
      .where(eq(tracks.id, id))
      .returning();
    return track || undefined;
  }

  async deleteTrack(id: number): Promise<boolean> {
    const result = await db.delete(tracks).where(eq(tracks.id, id));
    return result.rowCount > 0;
  }

  // Course methods
  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async getCourses(search?: string, trackId?: number): Promise<Course[]> {
    let query = db.select().from(courses);
    
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(courses.title, `%${search}%`),
          ilike(courses.instructor, `%${search}%`)
        )
      );
    }
    if (trackId) {
      conditions.push(eq(courses.trackId, trackId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(courses.createdAt));
  }

  async getCourseById(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async updateCourse(id: number, updates: Partial<Course>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, id))
      .returning();
    return course || undefined;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return result.rowCount > 0;
  }

  // Learner methods
  async createLearner(learner: InsertLearner): Promise<Learner> {
    const [newLearner] = await db.insert(learners).values(learner).returning();
    return newLearner;
  }

  async getLearners(search?: string, trackId?: number): Promise<Learner[]> {
    let query = db.select().from(learners);
    
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(learners.firstName, `%${search}%`),
          ilike(learners.lastName, `%${search}%`),
          ilike(learners.email, `%${search}%`)
        )
      );
    }
    if (trackId) {
      conditions.push(eq(learners.trackId, trackId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(learners.createdAt));
  }

  async getLearnerById(id: number): Promise<Learner | undefined> {
    const [learner] = await db.select().from(learners).where(eq(learners.id, id));
    return learner || undefined;
  }

  async updateLearner(id: number, updates: Partial<Learner>): Promise<Learner | undefined> {
    const [learner] = await db
      .update(learners)
      .set(updates)
      .where(eq(learners.id, id))
      .returning();
    return learner || undefined;
  }

  async deleteLearner(id: number): Promise<boolean> {
    const result = await db.delete(learners).where(eq(learners.id, id));
    return result.rowCount > 0;
  }

  // Invoice methods
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const [newInvoice] = await db
      .insert(invoices)
      .values({ ...invoice, invoiceNumber })
      .returning();
    return newInvoice;
  }

  async getInvoices(search?: string, status?: string): Promise<Invoice[]> {
    let query = db.select().from(invoices);
    
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(invoices.invoiceNumber, `%${search}%`),
          ilike(invoices.notes, `%${search}%`)
        )
      );
    }
    if (status) {
      conditions.push(eq(invoices.status, status));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(invoices.createdAt));
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async updateInvoice(id: number, updates: Partial<Invoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();
    return invoice || undefined;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return result.rowCount > 0;
  }

  // Dashboard analytics
  async getDashboardStats(): Promise<{
    totalLearners: number;
    totalRevenue: number;
    activeCourses: number;
    pendingInvoices: number;
  }> {
    const [learnersResult] = await db.select({ count: learners.id }).from(learners);
    const [revenueResult] = await db.select({ total: invoices.amount }).from(invoices).where(eq(invoices.status, 'paid'));
    const [coursesResult] = await db.select({ count: courses.id }).from(courses).where(eq(courses.status, 'active'));
    const [pendingResult] = await db.select({ count: invoices.id }).from(invoices).where(eq(invoices.status, 'pending'));

    return {
      totalLearners: learnersResult?.count || 0,
      totalRevenue: parseFloat(revenueResult?.total || '0'),
      activeCourses: coursesResult?.count || 0,
      pendingInvoices: pendingResult?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
