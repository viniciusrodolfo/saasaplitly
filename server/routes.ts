import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { 
  insertUserSchema, 
  insertClientSchema, 
  insertServiceSchema, 
  insertAppointmentSchema,
  insertAvailabilitySchema,
  insertBookingFormSchema,
  type User 
} from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
});

// Configure Passport
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Test database connection
  app.get("/api/test-db", async (req, res) => {
    try {
      await storage.ensureDbInitialized();
      res.json({ status: "Database connection successful" });
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({ status: "Database connection failed", error: String(error) });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      res.status(201).json({ 
        id: user.id, 
        email: user.email, 
        name: user.name 
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    const user = req.user as User;
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name 
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user as User;
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      businessName: user.businessName,
      phone: user.phone,
      avatar: user.avatar
    });
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const stats = await storage.getDashboardStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  // Today's appointments
  app.get("/api/appointments/today", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const appointments = await storage.getTodayAppointments(user.id);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching today's appointments" });
    }
  });

  // Clients routes
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const clients = await storage.getClients(user.id);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clients" });
    }
  });

  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const data = insertClientSchema.parse({ ...req.body, userId: user.id });
      const client = await storage.createClient(data);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating client" });
    }
  });

  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const id = parseInt(req.params.id);
      const data = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, user.id, data);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating client" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id, user.id);
      
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting client" });
    }
  });

  // Services routes
  app.get("/api/services", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const services = await storage.getServices(user.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services" });
    }
  });

  app.post("/api/services", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const data = insertServiceSchema.parse({ ...req.body, userId: user.id });
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating service" });
    }
  });

  app.put("/api/services/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const id = parseInt(req.params.id);
      const data = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, user.id, data);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating service" });
    }
  });

  app.delete("/api/services/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const id = parseInt(req.params.id);
      const success = await storage.deleteService(id, user.id);
      
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting service" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { date, status } = req.query;
      const filters: { date?: string; status?: string } = {};
      
      if (typeof date === 'string') filters.date = date;
      if (typeof status === 'string') filters.status = status;
      
      const appointments = await storage.getAppointments(user.id, filters);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  app.post("/api/appointments", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const data = insertAppointmentSchema.parse({ ...req.body, userId: user.id });
      const appointment = await storage.createAppointment(data);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating appointment" });
    }
  });

  app.put("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const id = parseInt(req.params.id);
      const data = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, user.id, data);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating appointment" });
    }
  });

  app.delete("/api/appointments/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const id = parseInt(req.params.id);
      const success = await storage.deleteAppointment(id, user.id);
      
      if (!success) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting appointment" });
    }
  });

  // Availability routes
  app.get("/api/availability", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const availability = await storage.getAvailability(user.id);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Error fetching availability" });
    }
  });

  app.put("/api/availability", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      console.log("Received availability data:", JSON.stringify(req.body, null, 2));
      const data = z.array(insertAvailabilitySchema).parse(req.body);
      const availabilities = data.map(item => ({ ...item, userId: user.id }));
      const result = await storage.updateAvailability(user.id, availabilities);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation error:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.log("Error updating availability:", error);
      res.status(500).json({ message: "Error updating availability" });
    }
  });

  // Booking form routes
  app.get("/api/booking-form", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const form = await storage.getBookingForm(user.id);
      res.json(form);
    } catch (error) {
      res.status(500).json({ message: "Error fetching booking form" });
    }
  });

  app.put("/api/booking-form", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const data = insertBookingFormSchema.partial().parse(req.body);
      const form = await storage.updateBookingForm(user.id, data);
      res.json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating booking form" });
    }
  });

  // Public booking routes (no auth required)
  app.get("/api/public/booking-form/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const form = await storage.getBookingForm(userId);
      const services = await storage.getServices(userId);
      
      if (!form) {
        return res.status(404).json({ message: "Booking form not found" });
      }
      
      res.json({ form, services });
    } catch (error) {
      res.status(500).json({ message: "Error fetching public booking form" });
    }
  });

  app.post("/api/public/appointments/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { name, email, phone, whatsapp, serviceId, date, time } = req.body;
      
      // Create client if doesn't exist
      let client = await storage.getClients(userId).then(clients => 
        clients.find(c => c.email === email)
      );
      
      if (!client) {
        client = await storage.createClient({
          userId,
          name,
          email,
          phone,
          whatsapp,
        });
      }
      
      // Create appointment
      const appointment = await storage.createAppointment({
        userId,
        clientId: client.id,
        serviceId: parseInt(serviceId),
        date,
        time,
        status: 'pending',
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Error creating appointment" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const analytics = await storage.getAnalyticsData(user.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
