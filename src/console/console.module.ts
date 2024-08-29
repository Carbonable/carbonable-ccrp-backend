import { Module } from '@nestjs/common';
import { BuildFixturesCommand } from './build-fixtures';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { FlushRedisCommand } from './flush-redis';

@Module({
  providers: [BuildFixturesCommand, FlushRedisCommand],
  exports: [BuildFixturesCommand, FlushRedisCommand],
  imports: [InfrastructureModule],
})
export class ConsoleModule {}
