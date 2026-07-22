import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { InternshipTrack } from '../enums/internship-track.enum';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateApplicantDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  fullName: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: '+251911223344', description: 'Phone number in international format' })
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Phone number must be a valid international phone number (e.g. +251911223344)',
  })
  phoneNumber: string;

  @ApiProperty({ example: 'Addis Ababa University' })
  @IsString()
  @IsNotEmpty({ message: 'University is required' })
  @MaxLength(150)
  university: string;

  @ApiProperty({ example: 2026, description: 'Expected/actual graduation year' })
  @IsInt({ message: 'Graduation year must be an integer' })
  @Min(CURRENT_YEAR - 10, { message: `Graduation year must be ${CURRENT_YEAR - 10} or later` })
  @Max(CURRENT_YEAR + 10, { message: `Graduation year must be ${CURRENT_YEAR + 10} or earlier` })
  graduationYear: number;

  @ApiProperty({ enum: InternshipTrack, example: InternshipTrack.BACKEND_DEVELOPMENT })
  @IsEnum(InternshipTrack, { message: `Internship track must be one of: ${Object.values(InternshipTrack).join(', ')}` })
  internshipTrack: InternshipTrack;

  @ApiPropertyOptional({ example: 'https://example.com/resume.pdf' })
  @IsOptional()
  @IsUrl({}, { message: 'Resume URL must be a valid URL' })
  resumeUrl?: string;

  @ApiPropertyOptional({ example: 'https://myportfolio.com' })
  @IsOptional()
  @IsUrl({}, { message: 'Portfolio URL must be a valid URL' })
  portfolioUrl?: string;

  @ApiPropertyOptional({ example: 'https://github.com/janedoe' })
  @IsOptional()
  @IsUrl({}, { message: 'GitHub URL must be a valid URL' })
  githubUrl?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/janedoe' })
  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn URL must be a valid URL' })
  linkedInUrl?: string;

  @ApiPropertyOptional({ example: 'Strong candidate, great GitHub portfolio.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  internalNotes?: string;
}
