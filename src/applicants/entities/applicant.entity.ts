import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicantStatus } from '../enums/applicant-status.enum';
import { InternshipTrack } from '../enums/internship-track.enum';

/**
 * Shape of an applicant as returned by the API. Decoupled from the Prisma
 * model so we can freely map DB-only enum identifiers to display strings
 * and omit internal fields (e.g. deletedAt) from responses.
 */
export class ApplicantEntity {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() email: string;
  @ApiProperty() phoneNumber: string;
  @ApiProperty() university: string;
  @ApiProperty() graduationYear: number;
  @ApiProperty({ enum: InternshipTrack }) internshipTrack: InternshipTrack;
  @ApiProperty({ enum: ApplicantStatus }) status: ApplicantStatus;

  @ApiPropertyOptional() resumeUrl?: string | null;
  @ApiPropertyOptional() portfolioUrl?: string | null;
  @ApiPropertyOptional() githubUrl?: string | null;
  @ApiPropertyOptional() linkedInUrl?: string | null;
  @ApiPropertyOptional() internalNotes?: string | null;

  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
