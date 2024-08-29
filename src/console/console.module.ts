import { Module } from '@nestjs/common';
import { BuildFixturesCommand } from './build-fixtures';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { FlushRedisCommand } from './flush-redis';
import { Vintage } from 'src/domain/portfolio';

@Module({
  providers: [BuildFixturesCommand, FlushRedisCommand],
  exports: [BuildFixturesCommand, FlushRedisCommand],
  imports: [InfrastructureModule, Vintage],
})
export class ConsoleModule {}
