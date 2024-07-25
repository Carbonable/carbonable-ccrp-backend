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

  parseCSV(buffer: Buffer): Promise<BusinessUnit[]> {
    return new Promise((resolve, reject) => {
      const results: BusinessUnit[] = [];

      const stream = Readable.from(buffer);
      stream
        .pipe(csv())
        .on('data', (data) => {
          try {
            const defaultEmission = parseInt(data.defaultEmission);
            const defaultTarget = parseInt(data.defaultTarget);
            const debt = parseInt(data.debt);
            const metadata = JSON.parse(data.metadata);

            if (isNaN(defaultEmission) || isNaN(defaultTarget) || isNaN(debt)) {
              throw new Error('Invalid number format');
            }

            const businessUnit: BusinessUnit = {
              id: data.id,
              name: data.name,
              description: data.description,
              defaultEmission,
              defaultTarget,
              debt,
              metadata,
              companyId: data.companyId,
            };

            results.push(businessUnit);
          } catch (error) {
            reject(new BadRequestException('Invalid file format: ' + error));
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
