import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

type ForecastEmission = Prisma.ForecastEmissionGetPayload<{
  include: {
    businessUnit: false;
  };
}>;

const FORECAST_EMISSSION_TABLE = 'forecast_emission';

@Injectable()
export class ForecastEmissionService {
  private readonly logger = new Logger(ForecastEmissionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.parseCSV(fileBuffer);
    await this.prisma.createManyOfType(FORECAST_EMISSSION_TABLE, data);
    return { message: 'ForecastEmissions uploaded successfully' };
  }

  public parseCSV(buffer: Buffer): Promise<ForecastEmission[]> {
    return new Promise((resolve, reject) => {
      const results: ForecastEmission[] = [];
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
    results: ForecastEmission[],
    reject: (reason?: any) => void,
  ): void {
    try {
      const carbonCredit = this.createForecastEmission(data);
      results.push(carbonCredit);
    } catch (error: any) {
      reject(new BadRequestException('Invalid file format: ' + error));
    }
  }

  private createForecastEmission(data: any): ForecastEmission {
    return {
      id: data.id ?? this.csv.emptyValueError('id'),
      quantity: this.csv.parseIntSafe(data.quantity),
      year: this.csv.parseIntSafe(data.year),
      businessUnitId:
        data.businessUnitId ?? this.csv.emptyValueError('businessUnitId'),
    };
  }
}
