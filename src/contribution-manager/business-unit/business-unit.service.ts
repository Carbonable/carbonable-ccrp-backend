import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';

export type BusinessUnit = Prisma.BusinessUnitGetPayload<{
  include: {
    forecastEmissions: false;
    forecastTargets: false;
    allocations: false;
    orders: false;
    company: false;
    Stock: false;
  };
}>;
export const BUSINESS_UNIT_MODEL = 'businessUnit';
@Injectable()
export class BusinessUnitService {
  logger = new Logger(BusinessUnitService.name);
  constructor(private prisma: PrismaService, private csv: CsvService) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.parseCSV(fileBuffer);

    await this.prisma.createManyOfType(BUSINESS_UNIT_MODEL, data);

    return { message: `BusinessUnits uploaded successfully` };
  }

  parseCSV(buffer: Buffer): Promise<BusinessUnit[]> {
    return new Promise((resolve, reject) => {
      const results: BusinessUnit[] = [];

      const stream = Readable.from(buffer);
      stream
        .pipe(csv({ strict: true }))
        .on('data', (data) => {
          try {
            const businessUnit: BusinessUnit = {
              id: data.id,
              name: data.name,
              description: data.description,
              defaultEmission: this.csv.parseIntSafe(data.defaultEmission),
              defaultTarget: this.csv.parseIntSafe(data.defaultTarget),
              debt: this.csv.parseIntSafe(data.debt),
              metadata: this.csv.parseJSONSafe(data.metadata),
              companyId: data.companyId,
            };
            results.push(businessUnit);
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
