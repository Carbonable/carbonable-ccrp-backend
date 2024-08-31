import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Prisma } from '@prisma/client';
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
    const data = await this.csv.parseCSV(
      fileBuffer,
      this.createForecast.bind(this),
    );
    this.logger.log('Creating ', type, data);

    await this.prisma.createManyOfType(type, data);
    return { message: 'Forecasts uploaded successfully' };
  }

  private createForecast(data: any): Forecast {
    return {
      id: this.csv.nonNullString(data, 'id'),
      quantity: this.csv.parseIntSafe(data.quantity),
      year: this.csv.parseIntSafe(data.year),
      businessUnitId: this.csv.nonNullString(data, 'business_unit_id'),
    };
  }
}
