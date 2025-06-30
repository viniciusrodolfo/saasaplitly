import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, count, sum, sql } from "drizzle-orm";
import {
  users,
  clients,
  services,
  appointments,
  availability,
  bookingForms,
  type User,
  type InsertUser,
  type Client,
  type InsertClient,
  type Service,
  type InsertService,
  type Appointment,
  type InsertAppointment,
  type AppointmentWithDetails,
  type Availability,
  type InsertAvailability,
  type BookingForm,
  type InsertBookingForm,
  type ClientWithStats,
} from "@shared/schema";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString);
const db = drizzle(client);

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create tables using raw SQL since drizzle-kit push was timing out
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255),
        phone VARCHAR(20),
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        whatsapp VARCHAR(20),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        is_enabled BOOLEAN DEFAULT true,
        morning_start TIME,
        morning_end TIME,
        afternoon_start TIME,
        afternoon_end TIME,
        UNIQUE(user_id, day_of_week)
      )
    `;

    await client`
      CREATE TABLE IF NOT EXISTS booking_forms (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) DEFAULT 'Book an Appointment',
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        theme VARCHAR(50) DEFAULT 'default',
        custom_fields JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Initialize database on startup
initializeDatabase();

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Clients
  getClients(userId: number): Promise<ClientWithStats[]>;
  getClient(id: number, userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, userId: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number, userId: number): Promise<boolean>;

  // Services
  getServices(userId: number): Promise<Service[]>;
  getService(id: number, userId: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, userId: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number, userId: number): Promise<boolean>;

  // Appointments
  getAppointments(userId: number, filters?: { date?: string; status?: string }): Promise<AppointmentWithDetails[]>;
  getAppointment(id: number, userId: number): Promise<AppointmentWithDetails | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, userId: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number, userId: number): Promise<boolean>;
  getTodayAppointments(userId: number): Promise<AppointmentWithDetails[]>;

  // Availability
  getAvailability(userId: number): Promise<Availability[]>;
  updateAvailability(userId: number, availabilities: InsertAvailability[]): Promise<Availability[]>;

  // Booking Forms
  getBookingForm(userId: number): Promise<BookingForm | undefined>;
  updateBookingForm(userId: number, form: Partial<InsertBookingForm>): Promise<BookingForm>;

  // Analytics
  getDashboardStats(userId: number): Promise<{
    todayAppointments: number;
    monthlyRevenue: number;
    totalClients: number;
    completionRate: number;
  }>;
  
  getAnalyticsData(userId: number): Promise<{
    totalRevenue: number;
    completedRevenue: number;
    cancelledRevenue: number;
    appointmentsByStatus: { status: string; count: number }[];
    revenueByService: { serviceName: string; revenue: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getClients(userId: number): Promise<ClientWithStats[]> {
    const result = await db
      .select({
        id: clients.id,
        userId: clients.userId,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        whatsapp: clients.whatsapp,
        status: clients.status,
        notes: clients.notes,
        createdAt: clients.createdAt,
        totalAppointments: count(appointments.id),
        lastVisit: sql<string | null>`MAX(${appointments.date})`,
      })
      .from(clients)
      .leftJoin(appointments, eq(clients.id, appointments.clientId))
      .where(eq(clients.userId, userId))
      .groupBy(clients.id)
      .orderBy(desc(clients.createdAt));
    
    return result as ClientWithStats[];
  }

  async getClient(id: number, userId: number): Promise<Client | undefined> {
    const result = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createClient(client: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(client).returning();
    return result[0];
  }

  async updateClient(id: number, userId: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const result = await db
      .update(clients)
      .set(client)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteClient(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return result.rowCount > 0;
  }

  async getServices(userId: number): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.userId, userId))
      .orderBy(desc(services.createdAt));
  }

  async getService(id: number, userId: number): Promise<Service | undefined> {
    const result = await db
      .select()
      .from(services)
      .where(and(eq(services.id, id), eq(services.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createService(service: InsertService): Promise<Service> {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  }

  async updateService(id: number, userId: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const result = await db
      .update(services)
      .set(service)
      .where(and(eq(services.id, id), eq(services.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteService(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(services)
      .where(and(eq(services.id, id), eq(services.userId, userId)));
    return result.rowCount > 0;
  }

  async getAppointments(userId: number, filters?: { date?: string; status?: string }): Promise<AppointmentWithDetails[]> {
    let query = db
      .select({
        id: appointments.id,
        userId: appointments.userId,
        clientId: appointments.clientId,
        serviceId: appointments.serviceId,
        date: appointments.date,
        time: appointments.time,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        client: clients,
        service: services,
      })
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.userId, userId));

    if (filters?.date) {
      query = query.where(and(eq(appointments.userId, userId), eq(appointments.date, filters.date)));
    }
    if (filters?.status) {
      query = query.where(and(eq(appointments.userId, userId), eq(appointments.status, filters.status)));
    }

    const result = await query.orderBy(desc(appointments.date), desc(appointments.time));
    return result as AppointmentWithDetails[];
  }

  async getAppointment(id: number, userId: number): Promise<AppointmentWithDetails | undefined> {
    const result = await db
      .select({
        id: appointments.id,
        userId: appointments.userId,
        clientId: appointments.clientId,
        serviceId: appointments.serviceId,
        date: appointments.date,
        time: appointments.time,
        status: appointments.status,
        notes: appointments.notes,
        createdAt: appointments.createdAt,
        client: clients,
        service: services,
      })
      .from(appointments)
      .innerJoin(clients, eq(appointments.clientId, clients.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
      .limit(1);
    
    return result[0] as AppointmentWithDetails;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async updateAppointment(id: number, userId: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const result = await db
      .update(appointments)
      .set(appointment)
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteAppointment(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
    return result.rowCount > 0;
  }

  async getTodayAppointments(userId: number): Promise<AppointmentWithDetails[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointments(userId, { date: today });
  }

  async getAvailability(userId: number): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.userId, userId))
      .orderBy(availability.dayOfWeek);
  }

  async updateAvailability(userId: number, availabilities: InsertAvailability[]): Promise<Availability[]> {
    // Delete existing availability
    await db.delete(availability).where(eq(availability.userId, userId));
    
    // Insert new availability
    if (availabilities.length > 0) {
      const result = await db.insert(availability).values(availabilities).returning();
      return result;
    }
    return [];
  }

  async getBookingForm(userId: number): Promise<BookingForm | undefined> {
    const result = await db
      .select()
      .from(bookingForms)
      .where(eq(bookingForms.userId, userId))
      .limit(1);
    return result[0];
  }

  async updateBookingForm(userId: number, form: Partial<InsertBookingForm>): Promise<BookingForm> {
    const existing = await this.getBookingForm(userId);
    
    if (existing) {
      const result = await db
        .update(bookingForms)
        .set(form)
        .where(eq(bookingForms.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(bookingForms)
        .values({ ...form, userId })
        .returning();
      return result[0];
    }
  }

  async getDashboardStats(userId: number): Promise<{
    todayAppointments: number;
    monthlyRevenue: number;
    totalClients: number;
    completionRate: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Today's appointments count
    const todayAppointmentsResult = await db
      .select({ count: count() })
      .from(appointments)
      .where(and(eq(appointments.userId, userId), eq(appointments.date, today)));

    // Monthly revenue (completed appointments only)
    const monthlyRevenueResult = await db
      .select({ revenue: sum(services.price) })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        eq(appointments.userId, userId),
        sql`${appointments.date} LIKE ${currentMonth + '%'}`,
        eq(appointments.status, 'completed')
      ));

    // Total clients
    const totalClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.userId, userId));

    // Completion rate (completed vs total this month)
    const monthlyAppointmentsResult = await db
      .select({ 
        total: count(),
        completed: count(sql`CASE WHEN ${appointments.status} = 'completed' THEN 1 END`)
      })
      .from(appointments)
      .where(and(
        eq(appointments.userId, userId),
        sql`${appointments.date} LIKE ${currentMonth + '%'}`
      ));

    const todayAppointments = todayAppointmentsResult[0]?.count || 0;
    const monthlyRevenue = parseFloat(monthlyRevenueResult[0]?.revenue?.toString() || '0');
    const totalClients = totalClientsResult[0]?.count || 0;
    const monthlyStats = monthlyAppointmentsResult[0];
    const completionRate = monthlyStats?.total > 0 
      ? Math.round((monthlyStats.completed / monthlyStats.total) * 100)
      : 0;

    return {
      todayAppointments,
      monthlyRevenue,
      totalClients,
      completionRate,
    };
  }

  async getAnalyticsData(userId: number): Promise<{
    totalRevenue: number;
    completedRevenue: number;
    cancelledRevenue: number;
    appointmentsByStatus: { status: string; count: number }[];
    revenueByService: { serviceName: string; revenue: number }[];
  }> {
    // Total revenue
    const totalRevenueResult = await db
      .select({ revenue: sum(services.price) })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.userId, userId));

    // Completed revenue
    const completedRevenueResult = await db
      .select({ revenue: sum(services.price) })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.userId, userId), eq(appointments.status, 'completed')));

    // Cancelled revenue
    const cancelledRevenueResult = await db
      .select({ revenue: sum(services.price) })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.userId, userId), eq(appointments.status, 'cancelled')));

    // Appointments by status
    const appointmentsByStatusResult = await db
      .select({ 
        status: appointments.status, 
        count: count() 
      })
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .groupBy(appointments.status);

    // Revenue by service
    const revenueByServiceResult = await db
      .select({ 
        serviceName: services.name,
        revenue: sum(services.price)
      })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .where(and(eq(appointments.userId, userId), eq(appointments.status, 'completed')))
      .groupBy(services.name);

    return {
      totalRevenue: parseFloat(totalRevenueResult[0]?.revenue?.toString() || '0'),
      completedRevenue: parseFloat(completedRevenueResult[0]?.revenue?.toString() || '0'),
      cancelledRevenue: parseFloat(cancelledRevenueResult[0]?.revenue?.toString() || '0'),
      appointmentsByStatus: appointmentsByStatusResult.map(item => ({
        status: item.status,
        count: item.count,
      })),
      revenueByService: revenueByServiceResult.map(item => ({
        serviceName: item.serviceName,
        revenue: parseFloat(item.revenue?.toString() || '0'),
      })),
    };
  }
}

export const storage = new DatabaseStorage();
