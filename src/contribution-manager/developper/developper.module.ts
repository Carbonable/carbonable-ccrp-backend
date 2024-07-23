import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma.module';
import { DevelopperController } from './developper.controller';
import { DevelopperService } from './developper.service';
import { CsvModule } from '../../csv/csv.module';

@Module({
  imports: [PrismaModule, CsvModule],
  providers: [DevelopperService],
  controllers: [DevelopperController],
  exports: [DevelopperService],
})
export class DevelopperModule {}
