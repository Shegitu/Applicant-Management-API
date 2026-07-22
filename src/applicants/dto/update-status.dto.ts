import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ApplicantStatus } from '../enums/applicant-status.enum';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ApplicantStatus,
    example: ApplicantStatus.SHORTLISTED,
    description: 'New status for the applicant',
  })
  @IsEnum(ApplicantStatus, { message: `Status must be one of: ${Object.values(ApplicantStatus).join(', ')}` })
  status: ApplicantStatus;
}
