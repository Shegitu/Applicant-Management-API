import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, InternshipTrack as PrismaTrack, ApplicantStatus as PrismaStatus } from '@prisma/client';
import { ApplicantsService } from './applicants.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicantStatus } from './enums/applicant-status.enum';
import { InternshipTrack } from './enums/internship-track.enum';

const baseApplicant = {
  id: 'applicant-uuid-1',
  fullName: 'Jane Doe',
  email: 'jane.doe@example.com',
  phoneNumber: '+251911223344',
  university: 'Addis Ababa University',
  graduationYear: 2026,
  internshipTrack: PrismaTrack.BACKEND_DEVELOPMENT,
  status: PrismaStatus.Pending,
  resumeUrl: null,
  portfolioUrl: null,
  githubUrl: null,
  linkedInUrl: null,
  internalNotes: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  deletedAt: null,
};

describe('ApplicantsService', () => {
  let service: ApplicantsService;
  let prisma: {
    applicant: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      applicant: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((ops) => Promise.all(ops)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicantsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ApplicantsService>(ApplicantsService);
  });

  describe('create', () => {
    const createDto = {
      fullName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phoneNumber: '+251911223344',
      university: 'Addis Ababa University',
      graduationYear: 2026,
      internshipTrack: InternshipTrack.BACKEND_DEVELOPMENT,
    };

    it('creates a new applicant when the email is unique', async () => {
      prisma.applicant.findUnique.mockResolvedValue(null);
      prisma.applicant.create.mockResolvedValue(baseApplicant);

      const result = await service.create(createDto as any);

      expect(result.email).toBe('jane.doe@example.com');
      expect(result.internshipTrack).toBe(InternshipTrack.BACKEND_DEVELOPMENT);
      expect(prisma.applicant.create).toHaveBeenCalled();
    });

    it('throws ConflictException when the email is already registered', async () => {
      prisma.applicant.findUnique.mockResolvedValue(baseApplicant);

      await expect(service.create(createDto as any)).rejects.toThrow(ConflictException);
      expect(prisma.applicant.create).not.toHaveBeenCalled();
    });

    it('translates a Prisma unique constraint race condition into ConflictException', async () => {
      prisma.applicant.findUnique.mockResolvedValue(null);
      prisma.applicant.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
      );

      await expect(service.create(createDto as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns the applicant when found and not deleted', async () => {
      prisma.applicant.findFirst.mockResolvedValue(baseApplicant);

      const result = await service.findOne(baseApplicant.id);

      expect(result.id).toBe(baseApplicant.id);
    });

    it('throws NotFoundException when the applicant does not exist', async () => {
      prisma.applicant.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('excludes soft-deleted applicants and returns pagination metadata', async () => {
      prisma.applicant.count.mockResolvedValue(1);
      prisma.applicant.findMany.mockResolvedValue([baseApplicant]);

      const result = await service.findAll({ page: 1, limit: 10 } as any);

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);

      const [countArgs] = prisma.applicant.count.mock.calls[0];
      expect(countArgs.where.deletedAt).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('allows Pending -> Shortlisted', async () => {
      prisma.applicant.findFirst.mockResolvedValue(baseApplicant);
      prisma.applicant.update.mockResolvedValue({ ...baseApplicant, status: PrismaStatus.Shortlisted });

      const result = await service.updateStatus(baseApplicant.id, { status: ApplicantStatus.SHORTLISTED });

      expect(result.status).toBe(ApplicantStatus.SHORTLISTED);
    });

    it('forbids Rejected -> Accepted (business rule)', async () => {
      prisma.applicant.findFirst.mockResolvedValue({ ...baseApplicant, status: PrismaStatus.Rejected });

      await expect(
        service.updateStatus(baseApplicant.id, { status: ApplicantStatus.ACCEPTED }),
      ).rejects.toThrow(UnprocessableEntityException);
      expect(prisma.applicant.update).not.toHaveBeenCalled();
    });

    it('allows Rejected -> Pending (re-opening an application)', async () => {
      prisma.applicant.findFirst.mockResolvedValue({ ...baseApplicant, status: PrismaStatus.Rejected });
      prisma.applicant.update.mockResolvedValue({ ...baseApplicant, status: PrismaStatus.Pending });

      const result = await service.updateStatus(baseApplicant.id, { status: ApplicantStatus.PENDING });

      expect(result.status).toBe(ApplicantStatus.PENDING);
    });
  });

  describe('remove', () => {
    it('soft-deletes the applicant by setting deletedAt', async () => {
      prisma.applicant.findFirst.mockResolvedValue(baseApplicant);
      prisma.applicant.update.mockResolvedValue({ ...baseApplicant, deletedAt: new Date() });

      await service.remove(baseApplicant.id);

      const [updateArgs] = prisma.applicant.update.mock.calls[0];
      expect(updateArgs.data.deletedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundException for an already soft-deleted applicant', async () => {
      prisma.applicant.findFirst.mockResolvedValue(null);

      await expect(service.remove('already-deleted-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateNotes', () => {
    it('updates internal notes for an existing applicant', async () => {
      prisma.applicant.findFirst.mockResolvedValue(baseApplicant);
      prisma.applicant.update.mockResolvedValue({ ...baseApplicant, internalNotes: 'Great candidate' });

      const result = await service.updateNotes(baseApplicant.id, { internalNotes: 'Great candidate' });

      expect(result.internalNotes).toBe('Great candidate');
    });
  });
});
