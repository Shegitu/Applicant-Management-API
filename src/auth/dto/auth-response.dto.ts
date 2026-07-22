import { ApiProperty } from '@nestjs/swagger';

export class AdminProfileDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() fullName: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT bearer access token' })
  accessToken: string;

  @ApiProperty({ type: AdminProfileDto })
  admin: AdminProfileDto;
}
