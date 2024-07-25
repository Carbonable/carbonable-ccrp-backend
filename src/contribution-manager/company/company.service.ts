import { Injectable, Logger, BadRequestException } from '@nestjs/common';
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
    private readonly csvService: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    let records: Company[];

    try {
      records = await this.csvService.parseCsvToArrayOfStrMap<Company>(
        fileBuffer,
      );
      this.logger.debug(`Companies: ${JSON.stringify(records)}`);
    } catch (error) {
      this.logger.error(`Error parsing CSV file: ${error}`);
      throw new BadRequestException('Invalid file format');
    }

    await this.prisma.createManyOfType(COMPANY_TABLE, records);
    return { message: 'Companies file uploaded successfully' };
  }
}
