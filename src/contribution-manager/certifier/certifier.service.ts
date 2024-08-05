import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';

type Certifier = Prisma.CertifierGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
  };
}>;

const CERTIFIER_TABLE = 'certifier';

@Injectable()
export class CertifierService {
  private readonly logger = new Logger(CertifierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csvService: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    let records: Certifier[];

    try {
      records = await this.csvService.parseCsvToArrayOfStrMap<Certifier>(
        fileBuffer,
      );
      this.logger.debug(`Certifier: ${JSON.stringify(records)}`);
    } catch (error) {
      this.logger.error(`Error parsing CSV file: ${error}`);
      throw new BadRequestException('Invalid file format');
    }

    await this.prisma.createManyOfType(CERTIFIER_TABLE, records);
    return { message: 'Certifier uploaded successfully' };
  }
}
