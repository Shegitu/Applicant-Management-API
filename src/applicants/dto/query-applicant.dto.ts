import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApplicantStatus } from '../enums/applicant-status.enum';
import { InternshipTrack } from '../enums/internship-track.enum';

export enum SortableField {
  CREATED_AT = 'createdAt',
  FULL_NAME = 'fullName',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryApplicantDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Page number (1-indexed)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Items per page (max 100)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'john', description: 'Search by fullName or email (partial match)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ApplicantStatus, description: 'Filter by applicant status' })
  @IsOptional()
  @IsEnum(ApplicantStatus, { message: `status must be one of: ${Object.values(ApplicantStatus).join(', ')}` })
  status?: ApplicantStatus;

  @ApiPropertyOptional({ enum: InternshipTrack, description: 'Filter by internship track' })
  @IsOptional()
  @IsEnum(InternshipTrack, { message: `track must be one of: ${Object.values(InternshipTrack).join(', ')}` })
  track?: InternshipTrack;

  @ApiPropertyOptional({ enum: SortableField, default: SortableField.CREATED_AT })
  @IsOptional()
  @IsIn(Object.values(SortableField), {
    message: `sortBy must be one of: ${Object.values(SortableField).join(', ')}`,
  })
  sortBy?: SortableField = SortableField.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsIn(Object.values(SortOrder), { message: `order must be one of: ${Object.values(SortOrder).join(', ')}` })
  order?: SortOrder = SortOrder.DESC;
}
