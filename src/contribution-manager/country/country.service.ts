import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';

export type Country = Prisma.CountryGetPayload<{
  include: {
    projects: false;
  };
}>;
export const COUNTRY_TABLE = 'country';
@Injectable()
export class CountryService {
  logger = new Logger(CountryService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<Country>(
      fileBuffer,
      this.createCountry.bind(this),
    );

    await this.prisma.createManyOfType(COUNTRY_TABLE, data);
    return { message: 'Country uploaded successfully' };
  }

  private createCountry(data: any): Country {
    return {
      id: this.csv.nonNullString(data, 'id'),
      name: this.csv.nonNullString(data, 'name'),
      code: this.csv.nonNullString(data, 'code'),
      data: this.csv.parseJSONSafe(data.data),
    };
  }
}
