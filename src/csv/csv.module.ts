// src/csv/csv.module.ts
import { Module } from '@nestjs/common';
import { CsvService } from './csv.service';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  ],
  providers: [CsvService],
  exports: [CsvService],
})
export class CsvModule {}
