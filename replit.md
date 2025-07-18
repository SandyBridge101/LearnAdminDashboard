# CClient Admin Dashboard

## Overview

This is a full-stack learning management system (LMS) admin dashboard built with React, TypeScript, Express, and PostgreSQL. The application provides comprehensive management capabilities for educational tracks, courses, learners, and invoices with a modern, responsive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Management**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Structure**: RESTful API with comprehensive CRUD operations
- **Validation**: Zod schemas shared between frontend and backend

## Key Components

### Authentication System
- JWT token-based authentication
- Password hashing with bcrypt
- OTP verification for account activation
- Password reset functionality
- Protected routes with authentication guards

### Database Schema
- **Admins**: User management with email verification
- **Tracks**: Learning track management with pricing and duration
- **Courses**: Individual courses linked to tracks
- **Learners**: Student management with track enrollment
- **Invoices**: Billing and payment tracking

### UI Components
- Comprehensive component library based on Radix UI
- Custom modal forms for data entry
- Responsive data tables with search and filtering
- Dashboard with analytics and statistics
- Mobile-friendly responsive design

### Data Management
- Server-side data fetching with React Query
- Optimistic updates for better UX
- Error handling and loading states
- Real-time data synchronization

## Data Flow

1. **Authentication Flow**: Login → JWT token → Protected routes
2. **Data Fetching**: React Query → Express API → Drizzle ORM → PostgreSQL
3. **Form Submission**: React Hook Form → Zod validation → API endpoints → Database
4. **State Updates**: Mutations → Cache invalidation → UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form management
- **zod**: Schema validation
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token management

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation
- Shared TypeScript types between frontend and backend
- Environment-based configuration

### Production Build
- Vite builds optimized client bundle
- ESBuild bundles server code
- Single deployment artifact with both frontend and backend
- Static assets served from Express

### Database Management
- Drizzle Kit for schema migrations
- Connection pooling with Neon serverless
- Environment-based database configuration
- Automatic schema validation

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript coverage across the stack
- **Real-time Updates**: Optimistic UI updates with React Query
- **Accessibility**: ARIA-compliant components using Radix UI
- **Security**: JWT authentication, password hashing, input validation
- **Performance**: Code splitting, lazy loading, optimized builds

The application follows modern web development practices with a focus on developer experience, type safety, and user interface responsiveness.