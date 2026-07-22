/**
 * Lifecycle status of an internship applicant.
 * Values are identical to the Prisma `ApplicantStatus` enum.
 */
export enum ApplicantStatus {
  PENDING = 'Pending',
  SHORTLISTED = 'Shortlisted',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

/**
 * Allowed status transitions.
 * Business rule: an applicant can NEVER move directly from Rejected -> Accepted.
 * All other transitions (including re-opening a rejected applicant) are permitted.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicantStatus, ApplicantStatus[]> = {
  [ApplicantStatus.PENDING]: [
    ApplicantStatus.SHORTLISTED,
    ApplicantStatus.ACCEPTED,
    ApplicantStatus.REJECTED,
  ],
  [ApplicantStatus.SHORTLISTED]: [
    ApplicantStatus.ACCEPTED,
    ApplicantStatus.REJECTED,
    ApplicantStatus.PENDING,
  ],
  [ApplicantStatus.ACCEPTED]: [ApplicantStatus.REJECTED],
  // Explicitly excludes ACCEPTED per business rule.
  [ApplicantStatus.REJECTED]: [ApplicantStatus.PENDING, ApplicantStatus.SHORTLISTED],
};

export function isTransitionAllowed(from: ApplicantStatus, to: ApplicantStatus): boolean {
  if (from === to) return true;
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
