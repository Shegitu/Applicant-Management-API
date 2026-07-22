import { Injectable } from '@nestjs/common';
import { ApplicantStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardSummaryDto } from './dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates applicant counts by status.
   * Soft-deleted applicants (deletedAt != null) are always excluded.
   */
  async getSummary(): Promise<DashboardSummaryDto> {
    const baseWhere = { deletedAt: null } as const;

    const [total, pending, shortlisted, accepted, rejected] = await this.prisma.$transaction([
      this.prisma.applicant.count({ where: baseWhere }),
      this.prisma.applicant.count({ where: { ...baseWhere, status: ApplicantStatus.Pending } }),
      this.prisma.applicant.count({ where: { ...baseWhere, status: ApplicantStatus.Shortlisted } }),
      this.prisma.applicant.count({ where: { ...baseWhere, status: ApplicantStatus.Accepted } }),
      this.prisma.applicant.count({ where: { ...baseWhere, status: ApplicantStatus.Rejected } }),
    ]);

    return {
      totalApplicants: total,
      pendingApplicants: pending,
      shortlistedApplicants: shortlisted,
      acceptedApplicants: accepted,
      rejectedApplicants: rejected,
    };
  }
}
