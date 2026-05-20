# BarangayLink

BarangayLink is a single-barangay community utility web application. It gives residents a mobile-friendly portal for local services, while giving barangay staff an admin workspace for daily operations.

The app is built with Next.js App Router, React, TypeScript, PostgreSQL, Drizzle ORM, Better Auth, Tailwind CSS, and Arcjet request protection.

## What The App Does

BarangayLink connects residents and barangay administrators around common local government workflows:

- Residents can register, sign in, update their profile, and assign themselves to a purok.
- Residents can view barangay announcements, emergency contacts, and waste collection status for their purok.
- Residents can submit document requests such as barangay clearance, certificate of indigency, business clearance, green card, and other requests.
- Residents can file community incident reports for waste, infrastructure, noise, safety, health, or other concerns.
- Admin users can manage puroks, announcements, emergency contacts, document requests, incident reports, and waste collection schedules.
- Admin users can track collection routes from scheduled to en route, collecting, and completed.

## Main Areas

### Public Site

The landing page introduces BarangayLink and links users to registration or sign in.

Key route:

- `/`

### Authentication

Authentication uses Better Auth with a Drizzle/PostgreSQL adapter. Login and registration server actions include Arcjet protection for rate limiting and bot detection.

Key routes:

- `/login`
- `/register`
- `/api/auth/[...all]`

### Resident Portal

Residents see a dashboard focused on their own barangay services:

- Purok-specific waste collection status
- Active community announcements
- Emergency contacts
- Document request submission and history
- Incident report submission and history
- Profile management

Key routes:

- `/portal`
- `/portal/documents`
- `/portal/reports`
- `/profile`

### Admin Dashboard

Admins get an operations dashboard with counts, quick actions, and management screens:

- Resident and purok overview
- Active announcements
- Emergency contact management
- Document request review and status updates
- Incident report review and status updates
- Waste schedule creation and route status updates

Key routes:

- `/admin`
- `/admin/announcements`
- `/admin/contacts`
- `/admin/puroks`
- `/admin/requests`
- `/admin/reports`
- `/basura`

## Data Model

The PostgreSQL schema is managed with Drizzle ORM. Main tables include:

- `users`: residents and admins, including role, contact number, and purok assignment
- `sessions`, `accounts`, `verifications`: Better Auth tables
- `puroks`: neighborhood clusters
- `announcements`: barangay advisories and updates
- `announcement_puroks`: announcement targeting by purok
- `waste_schedules`: collection schedules and route status
- `emergency_contacts`: barangay, fire, police, health, and other hotlines
- `document_requests`: resident document service requests
- `incident_reports`: resident-submitted community concerns

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM and Drizzle Kit
- Better Auth
- Arcjet
- Zod
- React Hook Form
- Zustand
- Lucide React
- Sonner

## Getting Started

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

If `.env.example` does not exist, create `.env.local` with these values:

```bash
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ARCJET_KEY=
NEXT_PUBLIC_BARANGAY_NAME="Barangay San Isidro"
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=
```

Prepare the database:

```bash
npm run db:migrate
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

- `npm run dev`: start the Next.js development server
- `npm run build`: build the app for production
- `npm run start`: start the production server after building
- `npm run db:generate`: generate Drizzle migrations
- `npm run db:migrate`: run Drizzle migrations
- `npm run db:push`: push schema changes to the database
- `npm run db:studio`: open Drizzle Studio
- `npm run db:seed`: seed admin, puroks, schedules, contacts, and sample announcement
- `npm run db:reset`: wipe and reset database tables

## Security Notes

- Better Auth manages sessions and secure cookies.
- Arcjet (`src/lib/arcjet.ts`) protects:
  - Login and registration server actions (IP + email rate limits, bot detection, Shield WAF)
  - Better Auth API POST routes (`/api/auth/sign-in/email`, sign-up, password change, etc.) so direct API abuse is blocked
  - Resident document and incident report submissions (IP rate limit + Shield)
- If `ARCJET_KEY` is unset, protection is skipped (fail-open) so local dev still works.
- Middleware protects resident and admin routes.
- Admin-only server actions verify the authenticated user's role before writing data.

## Project Structure

```text
src/app                  Next.js routes and pages
src/app/(auth)           Login and registration pages
src/app/(resident)       Resident portal and profile pages
src/app/(admin)          Admin dashboard and management pages
src/app/api/auth         Better Auth route handler
src/components           Shared UI components
src/db                   Drizzle schema, migrations, seed, reset, database client
src/lib/actions          Server actions for auth and app workflows
src/lib                  Auth config, validations, utilities, cached query helpers
src/store                Client-side UI state
public                   Icons, logo, manifest, favicon assets
```

## Current Status

BarangayLink is an MVP focused on one barangay. It covers core resident self-service and admin operations, with a schema and route structure that can be expanded for additional barangay services later.
