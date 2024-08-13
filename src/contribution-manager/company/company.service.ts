import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';

type Company = Prisma.CompanyGetPayload<{
  include: {
    configuration: false;
    projects: false;
    projectionSnapshots: false;
    historicalProjectionSnapshots: false;
    businessUnits: false;
  };
}>;

const COMPANY_TABLE = 'company';
@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<Company>(
      fileBuffer,
      this.createCompany.bind(this),
    );

    await this.prisma.createManyOfType(COMPANY_TABLE, data);
    return { message: 'Company uploaded successfully' };
  }

  private createCompany(data: any): Company {
    return {
      id: this.csv.nonNullString(data, 'id'),
      name: this.csv.nonNullString(data, 'name'),
      slug: this.csv.nonNullString(data, 'slug'),
    };
  }
}
