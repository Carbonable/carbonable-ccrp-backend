import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';

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
export const BUSINESS_UNIT_TABLE = 'businessUnit';
@Injectable()
export class BusinessUnitService {
  logger = new Logger(BusinessUnitService.name);
  constructor(private prisma: PrismaService, private csv: CsvService) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<BusinessUnit>(
      fileBuffer,
      this.createBusinessUnit.bind(this),
    );
    this.logger.log(data);
    await this.prisma.createManyOfType(BUSINESS_UNIT_TABLE, data);

    return { message: `BusinessUnits uploaded successfully` };
  }

  private createBusinessUnit(data: any): BusinessUnit {
    return {
      id: this.csv.nonNullString(data, 'id'),
      name: this.csv.nonNullString(data, 'name'),
      description: data.description,
      defaultEmission: this.csv.parseIntSafe(data.default_emission),
      defaultTarget: this.csv.parseIntSafe(data.default_target),
      debt: this.csv.parseIntSafe(data.debt),
      metadata: this.csv.parseJSONSafe(data.metadata),
      companyId: this.csv.nonNullString(data, 'company_id'),
    };
  }
}
