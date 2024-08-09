import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';

type Vintage = Prisma.VintageGetPayload<{
  include: {
    project: false;
  };
}>;

const VINTAGE_TABLE = 'vintage';

@Injectable()
export class VintageService {
  private readonly logger = new Logger(VintageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV(
      fileBuffer,
      this.createVintage.bind(this),
    );
    await this.prisma.createManyOfType(VINTAGE_TABLE, data);
    return { message: 'Vintages uploaded successfully' };
  }

  private createVintage(data: any): Vintage {
    const year = data.year ?? this.csv.emptyValueError('year');

    if (year.length !== 4) {
      throw new Error(`Wrong year number : ${year}`);
    }
    return {
      id: this.csv.nonNullString(data, 'id'),
      year,
      capacity: this.csv.parseIntSafe(data.capacity),
      available: this.csv.parseIntSafe(data.available),
      reserved: this.csv.parseIntSafe(data.reserved),
      consumed: this.csv.parseIntSafe(data.consumed),
      purchased: this.csv.parseIntSafe(data.purchased),
      purchasedPrice: this.csv.parseIntSafe(data.purchased_price),
      issuedPrice: this.csv.parseIntSafe(data.issued_price),
      projectId: this.csv.nonNullString(data, 'project_id'),
    };
  }
}
