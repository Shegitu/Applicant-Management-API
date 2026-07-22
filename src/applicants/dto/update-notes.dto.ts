import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateNotesDto {
  @ApiProperty({
    example: 'Excellent technical interview performance.',
    description: 'Internal recruiter notes (max 1000 characters)',
  })
  @IsString()
  @MaxLength(1000, { message: 'Notes cannot exceed 1000 characters' })
  internalNotes: string;
}
