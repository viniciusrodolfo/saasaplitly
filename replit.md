# Appointment Booking SaaS Platform

## Overview

This is a modern appointment booking SaaS platform built for service professionals to manage their business operations. The platform features a comprehensive dashboard, calendar management, client tracking, service configuration, and public booking forms. It's designed with a focus on user experience, featuring a modern UI with dark/light mode support and full responsiveness for desktop and mobile devices.

## System Architecture

The application follows a full-stack monolithic architecture with clear separation between client and server:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Authentication**: Passport.js with local strategy and session management
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for lightweight client-side routing
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for API state, React Context for auth and theme
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Structure**: RESTful API with Express.js
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Session-based auth with Passport.js and bcrypt
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware

### Database Schema
The application uses the following core entities:
- **Users**: Professional service providers with business information
- **Clients**: Customer records with contact details and status tracking
- **Services**: Configurable services with pricing and duration
- **Appointments**: Booking records linking clients, services, and time slots
- **Availability**: Professional's working hours and schedule preferences
- **Booking Forms**: Customizable public booking form configurations

## Data Flow

1. **Authentication Flow**: Users log in through Passport.js local strategy with session persistence
2. **Dashboard Data**: Real-time statistics and today's appointments fetched on load
3. **Calendar Management**: CRUD operations for appointments with date-based filtering
4. **Public Booking**: External clients can book through public forms without authentication
5. **Real-time Updates**: TanStack Query manages cache invalidation for immediate UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection (Neon compatible)
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **passport**: Authentication middleware
- **bcrypt**: Password hashing
- **express-session**: Session management

### UI Dependencies
- **@radix-ui/**: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution for development

## Deployment Strategy

The application is configured for deployment with the following approach:

1. **Build Process**: 
   - Frontend: Vite builds React app to `dist/public`
   - Backend: esbuild bundles server code to `dist/index.js`

2. **Environment Configuration**:
   - `DATABASE_URL`: PostgreSQL connection string (required)
   - `NODE_ENV`: Environment setting (development/production)

3. **Database Management**:
   - Drizzle migrations in `./migrations`
   - Schema definitions in `./shared/schema.ts`
   - Push commands for schema updates

4. **Production Ready**:
   - Static file serving for built frontend
   - Session store configuration
   - Error handling and logging
   - CORS and security middleware

The platform is designed to scale from individual professionals to larger service businesses, with a focus on ease of use and professional presentation for client-facing booking forms.

## Changelog
```
Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Migration completed from Replit Agent to Replit environment
  - Fixed database initialization and table creation
  - Resolved client modal data loading issue
  - Implemented multi-language support (Portuguese/English)
  - Enhanced booking form customization with theme preview
  - Fixed date/time formatting issues
  - Increased server payload limits
  - Added comprehensive color customization options
  - Resolved React component update warnings
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```