-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('Pending', 'Shortlisted', 'Accepted', 'Rejected');

-- CreateEnum
CREATE TYPE "InternshipTrack" AS ENUM ('FRONTEND_DEVELOPMENT', 'BACKEND_DEVELOPMENT', 'MOBILE_DEVELOPMENT', 'UI_UX_DESIGN', 'DATA_ANALYTICS');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "graduation_year" INTEGER NOT NULL,
    "internship_track" "InternshipTrack" NOT NULL,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'Pending',
    "resume_url" TEXT,
    "portfolio_url" TEXT,
    "github_url" TEXT,
    "linked_in_url" TEXT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_email_key" ON "applicants"("email");

-- CreateIndex
CREATE INDEX "applicants_status_idx" ON "applicants"("status");

-- CreateIndex
CREATE INDEX "applicants_internship_track_idx" ON "applicants"("internship_track");

-- CreateIndex
CREATE INDEX "applicants_deleted_at_idx" ON "applicants"("deleted_at");
