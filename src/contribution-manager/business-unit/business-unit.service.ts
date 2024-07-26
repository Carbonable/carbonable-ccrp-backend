import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { PrismaService } from '../../infrastructure/prisma.service';

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
  constructor(private prisma: PrismaService) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.parseCSV(fileBuffer);

    this.prisma.createManyOfType(BUSINESS_UNIT_MODEL, data);

    return { message: `BusinessUnits uploaded successfully` };
  }
  private parseIntSafe = (value: string): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) throw new Error(`Invalid number: ${value}`);
    return parsed;
  };

  private parseJSONSafe = (value: string): any => {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`Invalid JSON: ${value}`);
    }
  };
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
              defaultEmission: this.parseIntSafe(data.defaultEmission),
              defaultTarget: this.parseIntSafe(data.defaultTarget),
              debt: this.parseIntSafe(data.debt),
              metadata: this.parseJSONSafe(data.metadata),
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
