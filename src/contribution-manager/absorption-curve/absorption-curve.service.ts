import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CsvService } from '../../csv/csv.service';
import { Vintage } from '../../domain/portfolio';
import { UlidIdGenerator } from '../../domain/common';

type AbsorptionCurveType = {
  projectId: string;
  timestamp: number;
  absorption: number;
  issuedPrice: number;
};

@Injectable()
export class AbsorptionCurveService {
  private readonly logger = new Logger(AbsorptionCurveService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: CsvService,
  ) {}

  async processCsv(fileBuffer: Buffer): Promise<{ message: string }> {
    const data = await this.csv.parseCSV<AbsorptionCurveType>(
      fileBuffer,
      this.createAbsorptionCurve.bind(this),
    );
    this.logger.log('Creating Absorption Curves', data);

    await this.createVintageAndStock(data);

    return {
      message:
        'Absorption curve uploaded successfully. Vintage and Stock create succesfully',
    };
  }

  private createAbsorptionCurve(data: any): AbsorptionCurveType {
    return {
      projectId: this.csv.nonNullString(data, 'project_id'),
      timestamp: this.csv.parseIntSafe(data.timestamp),
      absorption: this.csv.parseIntSafe(data.absorption),
      issuedPrice: this.csv.parseIntSafe(data.issued_price),
    };
  }

  private async createVintageAndStock(data: any): Promise<void> {
    const vintages = await Vintage.buildFromAbsorptionCurve(
      new UlidIdGenerator(),
      data,
    );

    const updatedVintages: any = vintages.map((vintage, index) => ({
      ...vintage,
      projectId: data[index].projectId,
    }));

    await this.prisma.vintage.createMany({
      data: updatedVintages.map((v) => ({
        id: v.id,
        year: v.year,
        capacity: v._capacity,
        available: v._available,
        reserved: v._reserved,
        purchased: v._purchased,
        purchasedPrice: v._purchasedPrice,
        issuedPrice: v._issuedPrice,
        projectId: v.projectId,
      })),
    });

    await this.prisma.stock.createMany({
      data: updatedVintages.map((v) => ({
        id: new UlidIdGenerator().generate(),
        vintage: v.year,
        quantity: v._capacity,
        available: v._available,
        consumed: 0,
        purchased: v._purchased,
        purchasedPrice: v._purchasedPrice,
        issuedPrice: v._issuedPrice,
        projectId: v.projectId,
      })),
    });
  }
}
