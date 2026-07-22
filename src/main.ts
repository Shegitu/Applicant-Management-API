import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ---------------------------------------------------------------------
  // Security
  // ---------------------------------------------------------------------
  app.use(helmet());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // ---------------------------------------------------------------------
  // Swagger / OpenAPI documentation -> available at /api/docs
  // ---------------------------------------------------------------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Internship Applicant Management API')
    .setDescription(
      'Production-quality API for managing internship applicants: authentication, CRUD, ' +
        'search/filter/sort/pagination, status workflow, and dashboard statistics.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the JWT access token received from POST /api/auth/login',
      },
      'access-token',
    )
    .addTag('Auth', 'Administrator authentication')
    .addTag('Applicants', 'Applicant CRUD, status, and notes management')
    .addTag('Dashboard', 'Aggregate applicant statistics')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
