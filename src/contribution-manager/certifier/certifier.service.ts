import { Injectable, Logger } from '@nestjs/common';
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
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<Certifier>(
      fileBuffer,
      this.createCertifier.bind(this),
    );

    await this.prisma.createManyOfType(CERTIFIER_TABLE, data);
    return { message: 'Certifier uploaded successfully' };
  }

  // get all certifiers
  async getCertifiers(): Promise<Certifier[]> {
    return this.prisma.certifier.findMany();
  }

  private createCertifier(data: any): Certifier {
    return {
      id: this.csv.nonNullString(data, 'id'),
      name: this.csv.nonNullString(data, 'name'),
      slug: this.csv.nonNullString(data, 'slug'),
    };
  }
}
