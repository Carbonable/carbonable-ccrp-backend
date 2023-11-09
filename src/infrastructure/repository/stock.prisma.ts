import { Stock as StockModel } from '@prisma/client';
import { Stock, StockRepositoryInterface } from '../../domain/order-book';
import { PrismaService } from '../prisma.service';

export const STOCK_REPOSITORY = 'STOCK_REPOSITORY';
export class PrismaStockRepository implements StockRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findProjectStockForVintage(
    projectId: string,
    vintage: string,
  ): Promise<Stock[]> {
    return this.prismaToStock(
      await this.prisma.stock.findMany({
        where: {
          projectId,
          vintage,
        },
        orderBy: {
          vintage: 'asc',
        },
      }),
    );
  }
  async findAllocatedStockByVintage(businessUnitId: string): Promise<Stock[]> {
    return this.prismaToStock(
      await this.prisma.stock.findMany({
        where: {
          businessUnitId,
        },
        orderBy: {
          vintage: 'asc',
        },
      }),
    );
  }

  async save(stock: Stock[]): Promise<void> {
    await this.prisma.stock.createMany({
      data: stock.map((s) => ({
        id: s.id,
        vintage: s.vintage,
        quantity: s.quantity,
        available: s.available,
        consumed: s.consumed,
        projectId: s.projectId,
        businessUnitId: s.businessUnitId,
        allocationId: s.allocationId,
      })),
    });
  }

  async reserve(stock: Stock, quantity: number): Promise<void> {
    await this.prisma.stock.update({
      where: { id: stock.id },
      data: { available: stock.available - quantity },
    });
  }

  async findCompanyStock(companyId: string): Promise<Stock[]> {
    return this.prismaToStock(
      await this.prisma.stock.findMany({
        where: {
          businessUnit: { companyId },
        },
      }),
    );
  }
  async findBusinessUnitStock(businessUnitId: string): Promise<Stock[]> {
    return this.prismaToStock(
      await this.prisma.stock.findMany({
        where: {
          businessUnitId,
        },
      }),
    );
  }
  async findProjectStock(projectId: string): Promise<Stock[]> {
    return this.prismaToStock(
      await this.prisma.stock.findMany({
        where: {
          projectId,
        },
      }),
    );
  }

  prismaToStock(stock: StockModel[]): Stock[] {
    return stock.map((s) => {
      const stock = new Stock(
        s.id,
        s.businessUnitId,
        s.projectId,
        s.vintage,
        s.quantity,
        s.allocationId,
      );
      stock.lock(s.consumed);
      return stock;
    });
  }
}
