import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: { applicant: { count: jest.Mock }; $transaction: jest.Mock };

  beforeEach(async () => {
    prisma = {
      applicant: { count: jest.fn() },
      $transaction: jest.fn((ops) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('aggregates counts per status while excluding soft-deleted applicants', async () => {
    // total, pending, shortlisted, accepted, rejected
    prisma.applicant.count
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(5);

    const result = await service.getSummary();

    expect(result).toEqual({
      totalApplicants: 42,
      pendingApplicants: 15,
      shortlistedApplicants: 10,
      acceptedApplicants: 12,
      rejectedApplicants: 5,
    });

    for (const [args] of prisma.applicant.count.mock.calls) {
      expect(args.where.deletedAt).toBeNull();
    }
  });
});
