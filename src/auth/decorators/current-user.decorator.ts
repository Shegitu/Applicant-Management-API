import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Extracts the authenticated administrator (attached by JwtStrategy.validate)
 * from the request. Usage: @CurrentUser() admin: CurrentUserPayload
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
