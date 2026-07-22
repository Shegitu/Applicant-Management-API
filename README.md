# Internship Applicant Management API

A production-quality REST API for managing internship applicants, built with **NestJS**, **TypeScript**, **Prisma ORM**, and **Neon (serverless PostgreSQL)**. Built to demonstrate clean architecture, SOLID principles, and NestJS best practices for a technical assessment / production-style deliverable.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Database Setup (Neon)](#database-setup-neon)
8. [Migrations](#migrations)
9. [Seeding](#seeding)
10. [Running the App](#running-the-app)
11. [Testing](#testing)
12. [Swagger / API Docs](#swagger--api-docs)
13. [Authentication](#authentication)
14. [API Examples](#api-examples)
15. [Architecture Explanation](#architecture-explanation)
16. [Business Rules](#business-rules)
17. [Assumptions](#assumptions)
18. [Known Limitations](#known-limitations)
19. [Future Improvements](#future-improvements)

---

## Project Overview

The API lets an authenticated administrator manage internship applicants end-to-end: creating applications, searching/filtering/sorting/paginating them, moving applicants through a status workflow (Pending → Shortlisted → Accepted/Rejected), maintaining internal recruiter notes, and viewing aggregate dashboard statistics. All data is persisted in PostgreSQL (hosted on [Neon](https://neon.tech)) via Prisma ORM, with JWT-based authentication protecting every write and read operation except login.

## Features

- 🔐 JWT authentication (Passport strategy) with bcrypt password hashing
- 👤 Single seeded administrator account
- 🧑‍💼 Full applicant CRUD with soft delete (nothing is ever hard-deleted)
- 🔎 Search by name/email, filter by status/track (combinable), sort by multiple fields
- 📄 Pagination with full metadata (`page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrevious`)
- 🔄 Dedicated status-transition endpoint enforcing the Rejected → Accepted business rule
- 📝 Dedicated notes endpoint (max 1000 characters)
- 📊 Dashboard summary endpoint with per-status counts (soft-deleted applicants excluded)
- ✅ DTO validation via `class-validator`/`class-transformer` with a strict global `ValidationPipe`
- 🧯 Centralized exception handling with a consistent JSON error envelope
- 📚 Full Swagger/OpenAPI documentation at `/api/docs`
- 🛡️ Helmet, CORS, input sanitization, and duplicate-email prevention
- 🧪 Jest unit tests for auth, applicants, and dashboard services (validation, auth, business rules, status transitions) + an e2e smoke test

## Technology Stack

| Concern              | Choice                                   |
|----------------------|-------------------------------------------|
| Framework            | NestJS 10 (TypeScript)                    |
| ORM                  | Prisma ORM 5                              |
| Database             | PostgreSQL via **Neon** (serverless)      |
| Auth                 | Passport JWT + `@nestjs/jwt`              |
| Password hashing     | bcrypt                                    |
| Validation           | class-validator / class-transformer       |
| API docs             | @nestjs/swagger (OpenAPI 3)               |
| Testing              | Jest + Supertest                          |
| Security             | Helmet, CORS                              |
| Config               | @nestjs/config + dotenv                   |

## Folder Structure

```
src/
├── applicants/
│   ├── dto/                     # create/update/query/status/notes DTOs
│   ├── entities/                # ApplicantEntity (public API shape)
│   ├── enums/                   # ApplicantStatus, InternshipTrack (+ transition rules)
│   ├── applicants.controller.ts
│   ├── applicants.service.ts    # all business logic lives here
│   └── applicants.module.ts
├── auth/
│   ├── dto/                     # LoginDto, LoginResponseDto
│   ├── strategies/jwt.strategy.ts
│   ├── guards/jwt-auth.guard.ts
│   ├── decorators/              # @Public(), @CurrentUser()
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── dashboard/
│   ├── dashboard-summary.dto.ts
│   ├── dashboard.controller.ts
│   ├── dashboard.service.ts
│   └── dashboard.module.ts
├── prisma/
│   ├── prisma.service.ts        # PrismaClient lifecycle wrapper
│   └── prisma.module.ts         # @Global module, injected everywhere
├── config/
│   ├── configuration.ts         # typed config loader
│   └── env.validation.ts        # fails fast on missing/invalid env vars
├── common/
│   ├── dto/paginated-result.dto.ts
│   ├── filters/all-exceptions.filter.ts   # centralized error envelope
│   └── interceptors/response.interceptor.ts # centralized success envelope
├── app.module.ts
└── main.ts                      # bootstrap, Swagger, Helmet, CORS

prisma/
├── schema.prisma
└── seed.ts

test/
├── auth.e2e-spec.ts
└── jest-e2e.json
```

Controllers only call services (no business logic in controllers); services own all business rules and talk to Prisma exclusively through `PrismaService`, which acts as the repository layer.

## Installation

Requires **Node.js 18+** and **npm**.

```bash
git clone <this-repo-url>
cd internship-applicant-management-api
npm install
cp .env.example .env
# edit .env with your Neon connection string and JWT secret (see below)
```

## Environment Variables

Copy `.env.example` to `.env` and fill in real values. **Never commit `.env`.**

| Variable         | Description                                                                 |
|------------------|-------------------------------------------------------------------------------|
| `DATABASE_URL`   | Neon **pooled** connection string, used by Prisma Client at runtime          |
| `DIRECT_URL`     | Neon **direct** (non-pooled) connection string, used by `prisma migrate`     |
| `JWT_SECRET`     | Long random secret used to sign JWTs                                          |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d`, `12h`                                              |
| `PORT`           | Port the app listens on (default `3000`)                                     |
| `NODE_ENV`       | `development` \| `production` \| `test`                                      |
| `ADMIN_EMAIL`    | Email used only by `prisma/seed.ts` to seed the admin account                |
| `ADMIN_PASSWORD` | Plaintext password used only by the seed script (it is hashed before storage)|

## Database Setup (Neon)

1. Create a free project at [neon.tech](https://neon.tech).
2. In the Neon dashboard, copy the **pooled** connection string into `DATABASE_URL` and the **direct** connection string into `DIRECT_URL` (both are shown on the "Connection Details" panel — toggle "Pooled connection").
3. Both must include `?sslmode=require`.

> If you only have one connection string available, set `DIRECT_URL` to the same value as `DATABASE_URL` — migrations will still work, just without pooling optimizations.

## Migrations

```bash
# Generates the Prisma Client from schema.prisma
npm run prisma:generate

# Creates and applies a new migration against your Neon database (development)
npm run prisma:migrate

# Applies existing migrations without generating new ones (CI/production)
npm run prisma:migrate:deploy
```

## Seeding

```bash
npm run prisma:seed
```

This seeds:
- **1 administrator** — email/password from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (defaults to `admin@infnova.com` / `Admin123!`), stored as a bcrypt hash.
- **10 sample applicants** across all tracks and statuses, with realistic Ethiopian university/name data.

The seed script is idempotent (`upsert` on email), so it's safe to re-run.

## Running the App

```bash
npm run start:dev     # watch mode
npm run start         # standard
npm run start:prod    # run compiled dist/ (after `npm run build`)
```

The API listens on `http://localhost:3000` by default (see `PORT`).

## Testing

```bash
npm test              # unit tests
npm run test:cov      # unit tests with coverage report
npm run test:e2e      # HTTP-layer smoke tests (auth flow)
```

Unit tests mock `PrismaService` entirely, so they run without a live database. Coverage includes:
- **Auth**: successful login, wrong password, unknown email, `/me` profile lookup
- **Applicants**: create + duplicate-email conflict, find/paginate excluding soft-deleted rows, **status transition business rule** (Rejected → Accepted is rejected; Rejected → Pending is allowed), soft delete, notes update
- **Dashboard**: per-status aggregation excluding soft-deleted applicants

## Swagger / API Docs

Once running, interactive documentation (with a persisted "Authorize" JWT button) is available at:

```
http://localhost:3000/api/docs
```

Every endpoint documents its summary, description, parameters, request/response bodies, status codes, and auth requirements.

## Authentication

All endpoints require a JWT bearer token **except** `POST /api/auth/login`.

1. **Login**
   ```
   POST /api/auth/login
   { "email": "admin@infnova.com", "password": "Admin123!" }
   ```
   Returns `{ accessToken, admin }`.

2. **Use the token** on subsequent requests:
   ```
   Authorization: Bearer <accessToken>
   ```

3. **Get current profile**
   ```
   GET /api/auth/me
   ```

Unauthenticated or invalid-token requests receive `401 Unauthorized`.

## API Examples

**Create an applicant**
```bash
curl -X POST http://localhost:3000/api/applicants \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "email": "jane.doe@example.com",
    "phoneNumber": "+251911223344",
    "university": "Addis Ababa University",
    "graduationYear": 2026,
    "internshipTrack": "Backend Development"
  }'
```

**List with search, filter, sort, pagination**
```bash
curl "http://localhost:3000/api/applicants?search=jane&status=Pending&track=Backend%20Development&sortBy=createdAt&order=desc&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Change status**
```bash
curl -X PATCH http://localhost:3000/api/applicants/<id>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "Shortlisted" }'
```

**Dashboard summary**
```bash
curl http://localhost:3000/api/dashboard/summary -H "Authorization: Bearer <token>"
```

## Architecture Explanation

- **Layered / clean architecture**: `Controller → Service → PrismaService(repository)`. Controllers are thin — they validate the route/DTO shape via decorators and delegate directly to services; all business rules (uniqueness, status transitions, soft-delete semantics) live in services.
- **Global cross-cutting concerns** are wired once in `AppModule` via Nest's `APP_GUARD` / `APP_PIPE` / `APP_FILTER` / `APP_INTERCEPTOR` tokens: JWT auth guard, strict `ValidationPipe`, centralized `AllExceptionsFilter`, and a `ResponseInterceptor` that wraps every success response as `{ success, message, data }` — mirroring the `{ success: false, message, errors }` shape used for errors.
- **`PrismaModule` is `@Global()`**, so `PrismaService` (a thin `PrismaClient` subclass with Nest lifecycle hooks) can be injected anywhere without re-importing the module — this is our repository layer.
- **Enum boundary mapping**: Prisma enum identifiers can't contain spaces/slashes, so the DB stores `FRONTEND_DEVELOPMENT`, `UI_UX_DESIGN`, etc., while the public API/Swagger contract uses the human-readable `"Frontend Development"`, `"UI/UX Design"`, etc. The mapping lives in `applicants/enums/internship-track.enum.ts` and is applied at the service boundary, so nothing outside `ApplicantsService` needs to know about the distinction.
- **DTO validation** is enforced globally with `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true` — unknown fields are rejected, not silently dropped.

## Business Rules

All of the following are enforced in `ApplicantsService` (not the controller):

1. Applicant `email` must be unique (checked proactively + Prisma unique-constraint fallback → `409 Conflict`).
2. `internalNotes` cannot exceed 1000 characters (DTO-level `@MaxLength(1000)`).
3. An applicant **cannot** transition directly from `Rejected` → `Accepted` (`422 Unprocessable Entity`). All other transitions, including re-opening a rejected/accepted applicant back to `Pending` or `Shortlisted`, are allowed.
4. Only authenticated administrators can create, update, delete, or change status/notes of applicants (global `JwtAuthGuard`).
5. Applicants are **always soft-deleted** (`deletedAt` timestamp) — never physically removed.
6. Soft-deleted applicants never appear in list results or dashboard statistics (`deletedAt: null` is enforced on every applicant query).

## Assumptions

- Only a **single administrator role** exists — there is no multi-role/permission system, since the spec only asked for "administrator authentication."
- `graduationYear` is validated as a reasonable range (current year ± 10) rather than an arbitrary hardcoded value, to keep the API usable for years to come.
- Phone numbers are validated with a general international-format regex (`+` optional, 8–15 digits) rather than a specific country, since the spec didn't scope this to one region.
- "Search by fullName or email" is implemented as a case-insensitive partial (`contains`) match on either field (`OR`), which is the common interpretation of a search box.
- The `status` field is intentionally excluded from the general `PATCH /api/applicants/:id` DTO so that the Rejected→Accepted business rule can only ever be bypassed through one code path (`PATCH /:id/status`).

## Known Limitations

- No refresh-token flow — the JWT simply expires after `JWT_EXPIRES_IN` and the admin must log in again.
- No rate limiting / throttling is configured (would use `@nestjs/throttler` in a real production deployment).
- No file upload handling for resumes — `resumeUrl` is a plain string URL, not a stored file.
- The e2e test suite covers the auth flow only (with the service layer mocked) so it can run without a live database in restricted CI sandboxes; full e2e coverage against a real Neon database is left for a CI pipeline with provisioned test credentials.
- Prisma's query/schema engine binaries are downloaded from `binaries.prisma.sh` the first time you run `npm install` / `prisma generate` — this requires normal internet access on your machine (not an issue outside restricted/offline sandboxes).

## Future Improvements

- Refresh tokens + logout/token revocation
- Role-based access control (e.g. read-only recruiter vs full admin)
- Rate limiting (`@nestjs/throttler`) on the login endpoint
- Resume file upload to object storage (S3/Cloudinary) instead of a raw URL
- Audit log of status changes (who changed what, when)
- Bulk import/export of applicants (CSV)
- Full e2e test suite against a dockerized Postgres/Neon branch database in CI
