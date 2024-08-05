import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';

export type Country = Prisma.CountryGetPayload<{
  include: {
    projects: false;
  };
}>;
export const COUNTRY_MODEL = 'country';
@Injectable()
export class CountryService {
  logger = new Logger(CountryService.name);
  constructor(private prisma: PrismaService, private csvService: CsvService) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.parseCSV(fileBuffer);

    await this.prisma.createManyOfType(COUNTRY_MODEL, data);

    return { message: `countrys uploaded successfully` };
  }

  parseCSV(buffer: Buffer): Promise<Country[]> {
    return new Promise((resolve, reject) => {
      const results: Country[] = [];

      const stream = Readable.from(buffer);
      stream
        .pipe(csv({ strict: true }))
        .on('data', (data) => {
          try {
            const country: Country = {
              id: data.id,
              name: data.name,
              code: data.code,
              data: this.csvService.parseJSONSafe(data.data),
            };
            results.push(country);
          } catch (error: any) {
            reject(
              new BadRequestException('Invalid file format: ' + error.message),
            );
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(
            new BadRequestException(
              'Invalid file format: ' + JSON.stringify(error),
            ),
          );
        });
    });
  }
}
