import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const LOG_LEVEL: LogLevel[] =
  process.env.NODE_ENV === 'production'
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug'];

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: LOG_LEVEL });

  const config = new DocumentBuilder()
    .setTitle('Carbonable CCPM')
    .setDescription('The carbonable CCPM API description')
    .setVersion('1.0')
    .addTag('CCPM')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // allow conversion underneath
      },
    }),
  );

  app.enableCors({ origin: '*' });

  await app.listen(8080, '::');
}

bootstrap();
