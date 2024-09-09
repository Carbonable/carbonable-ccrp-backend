import { Module } from '@nestjs/common';
import { BuildFixturesCommand } from './build-fixtures';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  providers: [BuildFixturesCommand],
  exports: [BuildFixturesCommand],
  imports: [InfrastructureModule],
})
export class ConsoleModule { }
