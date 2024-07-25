import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';

type Developper = Prisma.DevelopperGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
  };
}>;

const DEVELOPPER_TABLE = 'developper';

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

    await this.prisma.createManyOfType(DEVELOPPER_TABLE, records);
    return { message: 'Developper uploaded successfully' };
  }
}
