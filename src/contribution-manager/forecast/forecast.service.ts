import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { ForecastType } from './types';

type Forecast = Prisma.ForecastEmissionGetPayload<{
  include: {
    businessUnit: false;
  };
}>;

@Injectable()
export class ForecastService {
  private readonly logger = new Logger(ForecastService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(
    fileBuffer: Buffer,
    type: ForecastType,
  ): Promise<{ message: string }> {
    const data = await this.parseCSV(fileBuffer);
    await this.prisma.createManyOfType(type, data);
    return { message: 'Forecasts uploaded successfully' };
  }

  public parseCSV(buffer: Buffer): Promise<Forecast[]> {
    return new Promise((resolve, reject) => {
      const results: Forecast[] = [];
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
    results: Forecast[],
    reject: (reason?: any) => void,
  ): void {
    try {
      const carbonCredit = this.createForecast(data);
      results.push(carbonCredit);
    } catch (error: any) {
      reject(new BadRequestException('Invalid file format: ' + error));
    }
  }

  private createForecast(data: any): Forecast {
    return {
      id: data.id ?? this.csv.emptyValueError('id'),
      quantity: this.csv.parseIntSafe(data.quantity),
      year: this.csv.parseIntSafe(data.year),
      businessUnitId:
        data.businessUnitId ?? this.csv.emptyValueError('businessUnitId'),
    };
  }
}
