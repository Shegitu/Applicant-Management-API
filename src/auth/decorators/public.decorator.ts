import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible, bypassing the global JwtAuthGuard.
 * Usage: @Public() above a controller method.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
