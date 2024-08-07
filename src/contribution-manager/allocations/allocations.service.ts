import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

type Allocation = Prisma.AllocationGetPayload<{
  include: {
    project: false;
    businessUnit: false;
  };
}>;

const ALLOCATION_TABLE = 'allocation';

@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.parseCSV(fileBuffer);
    await this.prisma.createManyOfType(ALLOCATION_TABLE, data);
    return { message: 'Allocations uploaded successfully' };
  }

  public parseCSV(buffer: Buffer): Promise<Allocation[]> {
    return new Promise((resolve, reject) => {
      const results: Allocation[] = [];
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
    results: Allocation[],
    reject: (reason?: any) => void,
  ): void {
    try {
      const carbonCredit = this.createAllocation(data);
      results.push(carbonCredit);
    } catch (error: any) {
      reject(new BadRequestException('Invalid file format: ' + error));
    }
  }

  private createAllocation(data: any): Allocation {
    return {
      id: data.id ?? this.csv.emptyValueError('id'),
      quantity: this.csv.parseIntSafe(data.quantity),
      allocatedAt: this.csv.parseDateSafe(data.allocatedAt),
      businessUnitId:
        data.businessUnitId ?? this.csv.emptyValueError('businessUnitId'),
      projectId: data.projectId ?? this.csv.emptyValueError('projectId'),
    };
  }
}
