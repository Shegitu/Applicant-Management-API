import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, Applicant as PrismaApplicant, ApplicantStatus as PrismaApplicantStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { QueryApplicantDto, SortableField, SortOrder } from './dto/query-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { ApplicantEntity } from './entities/applicant.entity';
import { ApplicantStatus, isTransitionAllowed } from './enums/applicant-status.enum';
import { trackFromDb, trackToDb } from './enums/internship-track.enum';
import { PaginatedResultDto } from '../common/dto/paginated-result.dto';

@Injectable()
export class ApplicantsService {
  private readonly logger = new Logger(ApplicantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Maps a raw Prisma row to the public ApplicantEntity, translating enums. */
  private toEntity(applicant: PrismaApplicant): ApplicantEntity {
    return {
      id: applicant.id,
      fullName: applicant.fullName,
      email: applicant.email,
      phoneNumber: applicant.phoneNumber,
      university: applicant.university,
      graduationYear: applicant.graduationYear,
      internshipTrack: trackFromDb(applicant.internshipTrack),
      status: applicant.status as unknown as ApplicantStatus,
      resumeUrl: applicant.resumeUrl,
      portfolioUrl: applicant.portfolioUrl,
      githubUrl: applicant.githubUrl,
      linkedInUrl: applicant.linkedInUrl,
      internalNotes: applicant.internalNotes,
      createdAt: applicant.createdAt,
      updatedAt: applicant.updatedAt,
    };
  }

  /** Fetches a non-deleted applicant by id or throws 404. */
  private async findActiveOrThrow(id: string): Promise<PrismaApplicant> {
    const applicant = await this.prisma.applicant.findFirst({
      where: { id, deletedAt: null },
    });

    if (!applicant) {
      throw new NotFoundException(`Applicant with id "${id}" was not found`);
    }
    return applicant;
  }

  async create(dto: CreateApplicantDto): Promise<ApplicantEntity> {
    const existing = await this.prisma.applicant.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(`An applicant with email "${dto.email}" already exists`);
    }

    try {
      const created = await this.prisma.applicant.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          university: dto.university,
          graduationYear: dto.graduationYear,
          internshipTrack: trackToDb(dto.internshipTrack),
          resumeUrl: dto.resumeUrl,
          portfolioUrl: dto.portfolioUrl,
          githubUrl: dto.githubUrl,
          linkedInUrl: dto.linkedInUrl,
          internalNotes: dto.internalNotes,
        },
      });
      this.logger.log(`Created applicant ${created.id} (${created.email})`);
      return this.toEntity(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`An applicant with email "${dto.email}" already exists`);
      }
      throw error;
    }
  }

  async findAll(query: QueryApplicantDto): Promise<PaginatedResultDto<ApplicantEntity>> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;

    const where: Prisma.ApplicantWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status as unknown as PrismaApplicantStatus } : {}),
      ...(query.track ? { internshipTrack: trackToDb(query.track) } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const sortBy = query.sortBy ?? SortableField.CREATED_AT;
    const order = query.order ?? SortOrder.DESC;
    const orderBy: Prisma.ApplicantOrderByWithRelationInput = { [sortBy]: order };

    const [total, applicants] = await this.prisma.$transaction([
      this.prisma.applicant.count({ where }),
      this.prisma.applicant.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return new PaginatedResultDto(applicants.map((a) => this.toEntity(a)), total, page, limit);
  }

  async findOne(id: string): Promise<ApplicantEntity> {
    const applicant = await this.findActiveOrThrow(id);
    return this.toEntity(applicant);
  }

  async update(id: string, dto: UpdateApplicantDto): Promise<ApplicantEntity> {
    await this.findActiveOrThrow(id);

    if (dto.email) {
      const existing = await this.prisma.applicant.findUnique({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`An applicant with email "${dto.email}" already exists`);
      }
    }

    try {
      const updated = await this.prisma.applicant.update({
        where: { id },
        data: {
          ...dto,
          internshipTrack: dto.internshipTrack ? trackToDb(dto.internshipTrack) : undefined,
        },
      });
      this.logger.log(`Updated applicant ${id}`);
      return this.toEntity(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`An applicant with email "${dto.email}" already exists`);
      }
      throw error;
    }
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<ApplicantEntity> {
    const applicant = await this.findActiveOrThrow(id);
    const currentStatus = applicant.status as unknown as ApplicantStatus;

    if (!isTransitionAllowed(currentStatus, dto.status)) {
      throw new UnprocessableEntityException(
        `Invalid status transition: cannot move an applicant directly from "${currentStatus}" to "${dto.status}"`,
      );
    }

    const updated = await this.prisma.applicant.update({
      where: { id },
      data: { status: dto.status as unknown as PrismaApplicantStatus },
    });

    this.logger.log(`Applicant ${id} status changed: ${currentStatus} -> ${dto.status}`);
    return this.toEntity(updated);
  }

  async updateNotes(id: string, dto: UpdateNotesDto): Promise<ApplicantEntity> {
    await this.findActiveOrThrow(id);
    const updated = await this.prisma.applicant.update({
      where: { id },
      data: { internalNotes: dto.internalNotes },
    });
    return this.toEntity(updated);
  }

  /** Soft delete - applicants are never permanently removed from the database. */
  async remove(id: string): Promise<void> {
    await this.findActiveOrThrow(id);
    await this.prisma.applicant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    this.logger.log(`Soft-deleted applicant ${id}`);
  }
}
