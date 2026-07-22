import { InternshipTrack as PrismaInternshipTrack } from '@prisma/client';

/**
 * Internship track, as exposed in the public API/Swagger contract.
 * These human-readable values are what clients send/receive in JSON.
 */
export enum InternshipTrack {
  FRONTEND_DEVELOPMENT = 'Frontend Development',
  BACKEND_DEVELOPMENT = 'Backend Development',
  MOBILE_DEVELOPMENT = 'Mobile Development',
  UI_UX_DESIGN = 'UI/UX Design',
  DATA_ANALYTICS = 'Data Analytics',
}

/** API display string -> Prisma DB enum identifier */
const TO_DB_MAP: Record<InternshipTrack, PrismaInternshipTrack> = {
  [InternshipTrack.FRONTEND_DEVELOPMENT]: PrismaInternshipTrack.FRONTEND_DEVELOPMENT,
  [InternshipTrack.BACKEND_DEVELOPMENT]: PrismaInternshipTrack.BACKEND_DEVELOPMENT,
  [InternshipTrack.MOBILE_DEVELOPMENT]: PrismaInternshipTrack.MOBILE_DEVELOPMENT,
  [InternshipTrack.UI_UX_DESIGN]: PrismaInternshipTrack.UI_UX_DESIGN,
  [InternshipTrack.DATA_ANALYTICS]: PrismaInternshipTrack.DATA_ANALYTICS,
};

/** Prisma DB enum identifier -> API display string */
const FROM_DB_MAP: Record<PrismaInternshipTrack, InternshipTrack> = {
  [PrismaInternshipTrack.FRONTEND_DEVELOPMENT]: InternshipTrack.FRONTEND_DEVELOPMENT,
  [PrismaInternshipTrack.BACKEND_DEVELOPMENT]: InternshipTrack.BACKEND_DEVELOPMENT,
  [PrismaInternshipTrack.MOBILE_DEVELOPMENT]: InternshipTrack.MOBILE_DEVELOPMENT,
  [PrismaInternshipTrack.UI_UX_DESIGN]: InternshipTrack.UI_UX_DESIGN,
  [PrismaInternshipTrack.DATA_ANALYTICS]: InternshipTrack.DATA_ANALYTICS,
};

export function trackToDb(track: InternshipTrack): PrismaInternshipTrack {
  return TO_DB_MAP[track];
}

export function trackFromDb(track: PrismaInternshipTrack): InternshipTrack {
  return FROM_DB_MAP[track];
}
