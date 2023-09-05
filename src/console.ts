import { AppModule } from './app.module';
import { LogLevel } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';

const LOG_LEVEL: LogLevel[] =
  process.env.NODE_ENV === 'production'
    ? ['error', 'warn', 'log']
    : ['error', 'warn', 'log', 'debug'];

async function bootstrap() {
  await CommandFactory.run(AppModule, { logger: LOG_LEVEL });
}

bootstrap();
