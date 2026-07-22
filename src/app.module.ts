import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ApplicantsModule } from './applicants/applicants.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AuthModule,
    ApplicantsModule,
    DashboardModule,
  ],
  providers: [
    // Global JWT guard - every route requires authentication unless
    // explicitly marked with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global validation pipe - transform + whitelist + forbidNonWhitelisted
    // as required by the spec.
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        // DTO shape/format validation errors -> 400 Bad Request.
        // Business-rule validation errors (e.g. invalid status transition)
        // are raised explicitly as 422 Unprocessable Entity from services.
      }),
    },
    // Centralized exception handling -> consistent { success, message, errors } shape
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // Wraps every successful response in { success: true, message, data }
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
