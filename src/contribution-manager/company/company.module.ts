import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CsvModule } from '../../csv/csv.module';

@Module({
  imports: [PrismaModule, CsvModule],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
