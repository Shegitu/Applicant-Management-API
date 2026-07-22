import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 }) page: number;
  @ApiProperty({ example: 10 }) limit: number;
  @ApiProperty({ example: 42 }) total: number;
  @ApiProperty({ example: 5 }) totalPages: number;
  @ApiProperty({ example: true }) hasNext: boolean;
  @ApiProperty({ example: false }) hasPrevious: boolean;
}

/**
 * Generic paginated response envelope returned by all list endpoints.
 */
export class PaginatedResultDto<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.max(Math.ceil(total / limit), 1);
    this.hasNext = page < this.totalPages;
    this.hasPrevious = page > 1;
  }
}
