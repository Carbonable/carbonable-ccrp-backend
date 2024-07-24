import {
  Injectable,
  Logger,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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

    try {
      await this.prisma.company.createMany({
        data: records,
        skipDuplicates: true,
      });
    } catch (error) {
      this.logger.error(`Error creating records: ${error}`);
      throw new HttpException(
        'Failed to create records. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'Companies file uploaded successfully' };
  }
}
