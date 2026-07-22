import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateApplicantDto } from './dto/update-applicant.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateNotesDto } from './dto/update-notes.dto';
import { QueryApplicantDto } from './dto/query-applicant.dto';
import { ApplicantEntity } from './entities/applicant.entity';

@ApiTags('Applicants')
@ApiBearerAuth('access-token')
@Controller('api/applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new applicant',
    description: 'Creates a new internship applicant. Requires administrator authentication. Email must be unique.',
  })
  @ApiResponse({ status: 201, description: 'Applicant created successfully', type: ApplicantEntity })
  @ApiConflictResponse({ description: 'An applicant with this email already exists' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  create(@Body() dto: CreateApplicantDto): Promise<ApplicantEntity> {
    return this.applicantsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List applicants',
    description:
      'Returns a paginated, searchable, filterable, sortable list of applicants. Soft-deleted applicants are always excluded.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of applicants' })
  findAll(@Query() query: QueryApplicantDto) {
    return this.applicantsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get applicant by id' })
  @ApiResponse({ status: 200, description: 'Applicant found', type: ApplicantEntity })
  @ApiNotFoundResponse({ description: 'Applicant not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ApplicantEntity> {
    return this.applicantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update applicant details',
    description: 'Partially updates applicant fields. Use the dedicated status/notes endpoints to change those fields.',
  })
  @ApiResponse({ status: 200, description: 'Applicant updated successfully', type: ApplicantEntity })
  @ApiNotFoundResponse({ description: 'Applicant not found' })
  @ApiConflictResponse({ description: 'Email already in use by another applicant' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicantDto,
  ): Promise<ApplicantEntity> {
    return this.applicantsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: "Update an applicant's status",
    description:
      'Transitions an applicant to a new status. Direct transition from Rejected to Accepted is forbidden.',
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: ApplicantEntity })
  @ApiNotFoundResponse({ description: 'Applicant not found' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid status transition' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ): Promise<ApplicantEntity> {
    return this.applicantsService.updateStatus(id, dto);
  }

  @Patch(':id/notes')
  @ApiOperation({
    summary: "Update an applicant's internal notes",
    description: 'Replaces the internal recruiter notes for an applicant. Maximum 1000 characters.',
  })
  @ApiResponse({ status: 200, description: 'Notes updated successfully', type: ApplicantEntity })
  @ApiNotFoundResponse({ description: 'Applicant not found' })
  updateNotes(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNotesDto,
  ): Promise<ApplicantEntity> {
    return this.applicantsService.updateNotes(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete an applicant',
    description: 'Marks the applicant as deleted. Applicants are never permanently removed from the database.',
  })
  @ApiResponse({ status: 200, description: 'Applicant deleted successfully' })
  @ApiNotFoundResponse({ description: 'Applicant not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ id: string; deleted: true }> {
    await this.applicantsService.remove(id);
    return { id, deleted: true };
  }
}
