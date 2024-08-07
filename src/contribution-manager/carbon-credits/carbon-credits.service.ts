import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

type CarbonCredit = Prisma.CarbonCreditGetPayload<{
  include: {
    project: false;
    Allocation: false;
  };
}>;

const CARBON_CREDIT_TABLE = 'carbon-credit';

@Injectable()
export class CarbonCreditService {
  private readonly logger = new Logger(CarbonCreditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.parseCSV(fileBuffer);
    await this.prisma.createManyOfType(CARBON_CREDIT_TABLE, data);
    return { message: 'CarbonCredits uploaded successfully' };
  }

  public parseCSV(buffer: Buffer): Promise<CarbonCredit[]> {
    return new Promise((resolve, reject) => {
      const results: CarbonCredit[] = [];
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
    results: CarbonCredit[],
    reject: (reason?: any) => void,
  ): void {
    try {
      const carbonCredit = this.createCarbonCredit(data);
      results.push(carbonCredit);
    } catch (error: any) {
      reject(new BadRequestException('Invalid file format: ' + error));
    }
  }

  private createCarbonCredit(data: any): CarbonCredit {
    return {
      id: data.id ?? this.csv.emptyValueError('id'),
      number: data.number ?? this.csv.emptyValueError('number'),
      vintage: data.vintage ?? this.csv.emptyValueError('vintage'),
      type: this.csv.checkAndParseCarbonCreditType(data.type),
      origin: this.csv.checkAndParseCarbonCreditOrigin(data.origin),
      purchasePrice: data.purchasePrice ? BigInt(data.purchasePrice) : null,
      isRetired: this.csv.parseBool(data.isRetired),
      isLocked: this.csv.parseBool(data.isLocked),
      isPurchased: this.csv.parseBool(data.isPurchased),
      auditStatus: this.csv.checkAndParseAuditStatus(data.auditStatus),
      projectId: data.projectId ?? this.csv.emptyValueError('projectId'),
      allocationId: data.allocationId || null,
    };
  }
}
