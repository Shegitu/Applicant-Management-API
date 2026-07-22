import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryDto } from './dashboard-summary.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get applicant statistics summary',
    description:
      'Returns aggregate counts of applicants by status. Soft-deleted applicants are excluded from all counts.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard summary', type: DashboardSummaryDto })
  getSummary(): Promise<DashboardSummaryDto> {
    return this.dashboardService.getSummary();
  }
}
