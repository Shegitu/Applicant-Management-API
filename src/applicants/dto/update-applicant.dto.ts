import { PartialType } from '@nestjs/swagger';
import { CreateApplicantDto } from './create-applicant.dto';

/**
 * All fields optional for partial updates (PATCH /api/applicants/:id).
 * Note: `status` is intentionally NOT part of this DTO - status changes
 * must go through PATCH /api/applicants/:id/status so the transition
 * business rule is always enforced.
 */
export class UpdateApplicantDto extends PartialType(CreateApplicantDto) {}
