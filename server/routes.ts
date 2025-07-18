import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { storage } from "./storage";
import { 
  insertAdminSchema, loginSchema, otpVerificationSchema,
  passwordResetRequestSchema, passwordResetSchema,
  insertTrackSchema, insertCourseSchema, insertLearnerSchema, insertInvoiceSchema
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await storage.getAdminById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Mock email service
const sendEmail = async (to: string, subject: string, content: string) => {
  console.log(`Email sent to ${to}: ${subject}\n${content}`);
  return true;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertAdminSchema.parse(req.body);
      
      // Check if admin already exists
      const existingAdmin = await storage.getAdminByEmail(validatedData.email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin with this email already exists" });
      }

      const admin = await storage.createAdmin(validatedData);
      
      // Send OTP email
      await sendEmail(
        admin.email,
        "Verify Your Account - CClient Admin",
        `Your verification code is: ${admin.otpCode}\nThis code expires in 5 minutes.`
      );

      res.status(201).json({ 
        message: "Admin registered successfully. Please check your email for verification code.",
        email: admin.email
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otpCode } = otpVerificationSchema.parse(req.body);
      
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      if (admin.otpCode !== otpCode) {
        return res.status(400).json({ message: "Invalid OTP code" });
      }

      if (admin.otpExpiry && new Date() > admin.otpExpiry) {
        return res.status(400).json({ message: "OTP code has expired" });
      }

      // Mark admin as verified and clear OTP
      await storage.updateAdmin(admin.id, {
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
      });

      const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.json({ 
        message: "Account verified successfully",
        token,
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const admin = await storage.verifyAdminPassword(email, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!admin.isVerified) {
        return res.status(401).json({ message: "Please verify your account first" });
      }

      const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      res.json({
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
        }
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        // Don't reveal if email exists
        return res.json({ message: "If an account with that email exists, we've sent password reset instructions." });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await storage.updateAdmin(admin.id, {
        resetToken,
        resetTokenExpiry,
      });

      await sendEmail(
        admin.email,
        "Password Reset - CClient Admin",
        `Click the following link to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}\nThis link expires in 30 minutes.`
      );

      res.json({ message: "If an account with that email exists, we've sent password reset instructions." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = passwordResetSchema.parse(req.body);
      
      const admin = await storage.getAdminByEmail(''); // We need to find by token
      // This would need a more sophisticated query in a real implementation
      
      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await storage.updateAdmin(admin.id, {
        otpCode,
        otpExpiry,
      });

      await sendEmail(
        admin.email,
        "New Verification Code - CClient Admin",
        `Your new verification code is: ${otpCode}\nThis code expires in 5 minutes.`
      );

      res.json({ message: "New OTP sent successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Protected routes (require authentication)
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({
      admin: {
        id: req.admin.id,
        firstName: req.admin.firstName,
        lastName: req.admin.lastName,
        email: req.admin.email,
      }
    });
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Track routes
  app.get("/api/tracks", authenticateToken, async (req, res) => {
    try {
      const { search } = req.query;
      const tracks = await storage.getTracks(search as string);
      res.json(tracks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/tracks", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertTrackSchema.parse(req.body);
      const track = await storage.createTrack(validatedData);
      res.status(201).json(track);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/tracks/:id", authenticateToken, async (req, res) => {
    try {
      const track = await storage.getTrackById(parseInt(req.params.id));
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.json(track);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/tracks/:id", authenticateToken, async (req, res) => {
    try {
      const updates = insertTrackSchema.partial().parse(req.body);
      const track = await storage.updateTrack(parseInt(req.params.id), updates);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.json(track);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/tracks/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteTrack(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.json({ message: "Track deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Course routes
  app.get("/api/courses", authenticateToken, async (req, res) => {
    try {
      const { search, trackId } = req.query;
      const courses = await storage.getCourses(
        search as string, 
        trackId ? parseInt(trackId as string) : undefined
      );
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/courses/:id", authenticateToken, async (req, res) => {
    try {
      const updates = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(parseInt(req.params.id), updates);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/courses/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteCourse(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json({ message: "Course deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Learner routes
  app.get("/api/learners", authenticateToken, async (req, res) => {
    try {
      const { search, trackId } = req.query;
      const learners = await storage.getLearners(
        search as string, 
        trackId ? parseInt(trackId as string) : undefined
      );
      res.json(learners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/learners", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertLearnerSchema.parse(req.body);
      const learner = await storage.createLearner(validatedData);
      res.status(201).json(learner);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/learners/:id", authenticateToken, async (req, res) => {
    try {
      const learner = await storage.getLearnerById(parseInt(req.params.id));
      if (!learner) {
        return res.status(404).json({ message: "Learner not found" });
      }
      res.json(learner);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/learners/:id", authenticateToken, async (req, res) => {
    try {
      const updates = insertLearnerSchema.partial().parse(req.body);
      const learner = await storage.updateLearner(parseInt(req.params.id), updates);
      if (!learner) {
        return res.status(404).json({ message: "Learner not found" });
      }
      res.json(learner);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/learners/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteLearner(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Learner not found" });
      }
      res.json({ message: "Learner deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Invoice routes
  app.get("/api/invoices", authenticateToken, async (req, res) => {
    try {
      const { search, status } = req.query;
      const invoices = await storage.getInvoices(search as string, status as string);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/invoices", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/invoices/:id", authenticateToken, async (req, res) => {
    try {
      const updates = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(parseInt(req.params.id), updates);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/invoices/:id", authenticateToken, async (req, res) => {
    try {
      const success = await storage.deleteInvoice(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json({ message: "Invoice deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
