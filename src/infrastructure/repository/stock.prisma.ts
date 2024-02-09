import {
  Stock as StockModel,
  Reservation as ReservationModel,
} from '@prisma/client';
import {
  Stock,
  StockRepositoryInterface,
  StockAvailability,
  StockAndReservation,
  Reservation,
} from '../../domain/order-book';
import { PrismaService } from '../prisma.service';
import { Demand } from '../../domain/business-unit';

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
  async findAllocatedStockByVintage(
    businessUnitId: string,
    allocationIds: string[],
  ): Promise<Stock[]> {
    return this.prismaToStock(
      await this.prisma.stock.findMany({
        where: {
          businessUnitId,
          allocationId: {
            in: allocationIds,
          },
        },
        orderBy: {
          vintage: 'asc',
        },
      }),
    );
  }

  async save(stock: Stock[]): Promise<void> {
    await this.prisma.$transaction(
      stock.map((s) => {
        return this.prisma.stock.upsert({
          where: { id: s.id },
          update: {
            vintage: s.vintage,
            quantity: s.quantity,
            available: s.available,
            consumed: s.consumed,
            purchased: s.purchased,
          },
          create: {
            id: s.id,
            vintage: s.vintage,
            quantity: s.quantity,
            available: s.available,
            consumed: s.consumed,
            projectId: s.projectId,
            businessUnitId: s.businessUnitId,
            allocationId: s.allocationId,
            purchased: s.purchased,
            purchased_price: s.purchasedPrice,
            issued_price: s.issuedPrice,
          },
        });
      }),
    );
  }

  async reserve(stock: Stock, quantity: number): Promise<void> {
    stock.lock(quantity);
    await this.prisma.stock.update({
      where: { id: stock.id },
      data: {
        available: stock.available,
        consumed: stock.consumed,
      },
    });
  }

  async findCompanyStock(companyId: string): Promise<StockAndReservation> {
    const reservations = this.prismaToReservation(
      await this.prisma.reservation.findMany({
        where: {
          stock: {
            project: { companyId },
          },
        },
        orderBy: [{ vintage: 'asc' }],
      }),
    );
    // const hasAllocations = await this.companyHasAllocations(companyId);
    //
    // if (hasAllocations) {
    //   return this.prismaToStock(
    //     await this.prisma.stock.findMany({
    //       where: {
    //         project: { companyId },
    //         NOT: { allocationId: null, businessUnitId: null },
    //       },
    //       orderBy: [{ vintage: 'asc' }],
    //     }),
    //   );
    // }

    return {
      stock: this.prismaToStock(
        await this.prisma.stock.findMany({
          where: {
            project: { companyId },
            allocationId: null,
          },
          orderBy: [{ vintage: 'asc' }],
        }),
      ),
      reservations,
    };
  }
  async findBusinessUnitStock(
    businessUnitId: string,
  ): Promise<StockAndReservation> {
    return {
      stock: this.prismaToStock(
        await this.prisma.stock.findMany({
          where: {
            businessUnitId,
          },
          orderBy: [{ vintage: 'asc' }],
        }),
      ),
      reservations: this.prismaToReservation(
        await this.prisma.reservation.findMany({
          where: { stock: { businessUnitId } },
          orderBy: [{ vintage: 'asc' }],
        }),
      ),
    };
  }
  async findProjectStock(projectId: string): Promise<StockAndReservation> {
    return {
      stock: this.prismaToStock(
        await this.prisma.stock.findMany({
          where: {
            projectId,
          },
          orderBy: [{ vintage: 'asc' }],
        }),
      ),
      reservations: this.prismaToReservation(
        await this.prisma.reservation.findMany({
          where: { stock: { projectId } },
          orderBy: [{ vintage: 'asc' }],
        }),
      ),
    };
  }

  async availableToAllocate(
    projectId: string,
    demands: Demand[],
  ): Promise<StockAvailability> {
    const stock = this.prismaToStock(
      await this.prisma.stock.findMany({
        where: {
          projectId,
          allocationId: null,
        },
        orderBy: [{ vintage: 'asc' }],
      }),
    );
    const available = stock.reduce((acc, curr) => acc + curr.available, 0);
    if (demands.length === 0) {
      return {
        percentage: 100,
        units: available,
      };
    }

    const totalDemand = demands.reduce(
      (acc, curr) => acc + curr.emission * (curr.target / 100),
      0,
    );

    return {
      percentage:
        available > totalDemand ? 100 : (available / totalDemand) * 100,
      units: available,
    };
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
        s.purchased,
        s.purchased_price,
        s.issued_price,
      );
      stock.lock(s.consumed);
      stock.retire(s.retired);
      return stock;
    });
  }
  prismaToReservation(reservation: ReservationModel[]): Reservation[] {
    return reservation.map((r) => {
      return new Reservation(
        r.id,
        r.orderId,
        r.vintage,
        r.reservationForYear,
        r.quantity,
        r.stockId,
      );
    });
  }
  async companyHasAllocations(companyId: string): Promise<boolean> {
    const res = await this.prisma.allocation.count({
      where: {
        businessUnit: { company: { id: companyId } },
      },
    });

    return res > 0;
  }
}
