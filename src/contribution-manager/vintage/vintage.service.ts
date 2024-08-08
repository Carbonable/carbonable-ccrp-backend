import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

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
    const data = await this.parseCSV(fileBuffer);
    await this.prisma.createManyOfType(VINTAGE_TABLE, data);
    return { message: 'Vintages uploaded successfully' };
  }

  public parseCSV(buffer: Buffer): Promise<Vintage[]> {
    return new Promise((resolve, reject) => {
      const results: Vintage[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv({ strict: true }))
        .on('data', (data) => this.handleCsvData(data, results, reject))
        .on('end', () => resolve(results))
        .on('error', (error) =>
          reject(new BadRequestException('Invalid file format: ' + error)),
        );
    });
  }

  private handleCsvData(
    data: any,
    results: Vintage[],
    reject: (reason?: any) => void,
  ): void {
    try {
      const carbonCredit = this.createVintage(data);
      results.push(carbonCredit);
    } catch (error: any) {
      reject(new BadRequestException('Invalid file format: ' + error));
    }
  }

  private createVintage(data: any): Vintage {
    const year = data.year ?? this.csv.emptyValueError('year');
    if (year.length !== 4) {
      throw new Error(`Wrong year number : ${year}`);
    }
    return {
      id: data.id && data.id !== '' ? data.id : this.csv.emptyValueError('id'),
      year,
      capacity: this.csv.parseIntSafe(data.capacity),
      available: this.csv.parseIntSafe(data.available),
      reserved: this.csv.parseIntSafe(data.reserved),
      consumed: this.csv.parseIntSafe(data.consumed),
      purchased: this.csv.parseIntSafe(data.purchased),
      purchased_price: this.csv.parseIntSafe(data.purchased_price),
      issued_price: this.csv.parseIntSafe(data.issued_price),
      projectId: data.projectId ?? this.csv.emptyValueError('projectId'),
    };
  }
}
