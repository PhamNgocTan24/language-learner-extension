import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — strips unknown properties, transforms types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global serializer — respects @Exclude() / @Expose() on response DTOs
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // CORS — allow Chrome extension and Next.js frontend
  app.enableCors({
    origin: [process.env.FRONTEND_URL ?? 'http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  // Swagger UI — available at /api/docs
  const config = new DocumentBuilder()
    .setTitle('LearnClip API')
    .setDescription('Backend API for the LearnClip English learning Chrome extension')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`LearnClip API running on http://localhost:${port}`);
}

bootstrap();
