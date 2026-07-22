import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({ example: 42, description: 'Total number of active (non-deleted) applicants' })
  totalApplicants: number;

  @ApiProperty({ example: 15 })
  pendingApplicants: number;

  @ApiProperty({ example: 10 })
  shortlistedApplicants: number;

  @ApiProperty({ example: 12 })
  acceptedApplicants: number;

  @ApiProperty({ example: 5 })
  rejectedApplicants: number;
}
