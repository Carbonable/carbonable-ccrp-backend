import { Module } from '@nestjs/common';
import { SnapshotHydratorCommand } from './hydrate-snapshots';
import { BuildFixturesCommand } from './build-fixtures';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  providers: [SnapshotHydratorCommand, BuildFixturesCommand],
  exports: [SnapshotHydratorCommand, BuildFixturesCommand],
  imports: [InfrastructureModule],
})
export class ConsoleModule {}
