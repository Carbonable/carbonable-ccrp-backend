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

type Developper = Prisma.DevelopperGetPayload<{
  //   include: {
  //     configuration: false;
  //     projects: false;
  //     projectionSnapshots: false;
  //     historicalProjectionSnapshots: false;
  //     businessUnits: false;
  //   };
}>;

@Injectable()
export class DevelopperService {
  private readonly logger = new Logger(DevelopperService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csvService: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    let records: Developper[];

    try {
      records = await this.csvService.parseCsvToArrayOfStrMap<Developper>(
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
        HttpStatus.BAD_REQUEST,
      );
    }
    return { message: 'Company uploaded successfully' };
  }
}
