import {
  EffectiveCompensation,
  EffectiveContribution,
  Order,
  OrderBookRepositoryInterface,
  OrderStatus,
  Reservation,
} from '../../domain/order-book';
import Utils from '../../utils';
import { PrismaService } from '../prisma.service';
import { Order as OrdersModel } from '@prisma/client';

export const ORDER_BOOK_REPOSITORY = 'ORDER_BOOK_REPOSITORY';

export class PrismaOrderBookRepository implements OrderBookRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findByBusinessUnitIds(businessUnitIds: string[]): Promise<Order[]> {
    return prismaToOrder(
      await this.prisma.order.findMany({
        where: {
          businessUnitId: {
            in: businessUnitIds,
          },
        },
        include: {
          reservations: true,
          executions: true,
        },
      }),
    );
  }

  async findOrderForDemand(
    businessUnitId: string,
    year: string,
  ): Promise<Order> {
    return prismaToOrder([
      await this.prisma.order.findFirst({
        where: { businessUnitId, year: parseInt(year) },
        include: { reservations: true, executions: true },
      }),
    ]).shift();
  }

  async listOrdersFor(id: string): Promise<Order[]> {
    return prismaToOrder(
      await this.prisma.order.findMany({
        where: { businessUnitId: id },
        include: { reservations: true, executions: true },
      }),
    );
  }

  async save(orders: Order[]): Promise<void> {
    for (const order of orders) {
      await this.prisma.order.upsert({
        where: {
          year_businessUnitId: {
            businessUnitId: order.businessUnitId,
            year: parseInt(order.year),
          },
        },
        create: { ...upsertOrderToPrisma(order) },
        update: {
          ...upsertOrderToPrisma(order),
        },
        include: {
          reservations: true,
        },
      });

      for (const reservation of order.reservations) {
        await this.prisma.reservation.upsert({
          where: { id: reservation.id },
          create: {
            id: reservation.id,
            orderId: reservation.orderId,
            quantity: reservation.count,
            stockId: reservation.stockId,
            vintage: reservation.vintage,
            reservationForYear: reservation.reservedFor,
          },
          update: {
            orderId: reservation.orderId,
            quantity: reservation.count,
            stockId: reservation.stockId,
            vintage: reservation.vintage,
            reservationForYear: reservation.reservedFor,
          },
        });
      }
    }
  }
  async getBusinessUnitYearlyEffectiveCompensation(
    businessUnitId: string,
  ): Promise<EffectiveCompensation[]> {
    const orders = await this.prisma.order.findMany({
      where: { businessUnitId: businessUnitId },
      include: { reservations: true, executions: true },
      orderBy: { year: 'asc' },
    });
    return Utils.orderByYear(
      orders.map(
        (o) => new EffectiveCompensation(o.year.toString(), o.quantity),
      ),
    );
  }

  async getBusinessUnitYearlyEffectiveContribution(
    businessUnitId: string,
  ): Promise<EffectiveContribution[]> {
    const orders = await this.prisma.stock.findMany({
      where: { businessUnitId },
      orderBy: { vintage: 'asc' },
    });
    return Utils.orderByVintage(
      orders.map(
        (o) =>
          new EffectiveContribution(
            o.vintage.toString(),
            Utils.priceDecimal(
              o.quantity * o.issuedPrice + o.purchased * o.purchasedPrice,
            ),
          ),
      ),
    );
  }

  async getCompanyYearlyEffectiveCompensation(
    companyId: string,
  ): Promise<EffectiveCompensation[]> {
    const orders = await this.prisma.order.findMany({
      where: { businessUnit: { companyId } },
      include: { reservations: true, executions: true },
    });
    return Utils.orderByVintage(
      orders.map(
        (o) => new EffectiveCompensation(o.year.toString(), o.quantity),
      ),
    );
  }
  async getProjectYearlyEffectiveCompensation(
    projectId: string,
  ): Promise<EffectiveCompensation[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        businessUnit: { allocations: { some: { projectId } } },
      },
    });
    return Utils.orderByVintage(
      orders.map(
        (o) => new EffectiveCompensation(o.year.toString(), o.quantity),
      ),
    );
  }

  async getCompanyOrders(companyId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: { businessUnit: { companyId }, status: OrderStatus.CLOSED },
      include: { reservations: true, executions: true },
    });

    return prismaToOrder(orders);
  }

  async getProjectOrders(projectId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        businessUnit: { allocations: { some: { projectId } } },
      },
      include: { reservations: true, executions: true },
    });
    return prismaToOrder(orders);
  }

  async getProjectTotalInvestedAmount(projectId: string): Promise<number> {
    const vintages = await this.prisma.vintage.findMany({
      where: { projectId },
    });
    return vintages.reduce(
      (acc, v) =>
        acc +
        v.capacity * Utils.priceDecimal(v.issuedPrice) +
        v.purchased * Utils.priceDecimal(v.purchasedPrice),
      0,
    );
  }
  async getBusinessUnitTotalInvestedAmount(
    businessUnitId: string,
  ): Promise<number> {
    const allocatedStock = await this.prisma.stock.findMany({
      where: { businessUnitId },
    });

    return allocatedStock.reduce(
      (acc, v) =>
        acc +
        v.quantity * Utils.priceDecimal(v.issuedPrice) +
        v.purchased * Utils.priceDecimal(v.purchasedPrice),
      0,
    );
  }
  async getCompanyTotalInvestedAmount(companyId: string): Promise<number> {
    const vintages = await this.prisma.vintage.findMany({
      where: {
        project: {
          companyId,
        },
      },
    });

    return vintages.reduce(
      (acc, v) =>
        acc +
        (v.capacity * Utils.priceDecimal(v.issuedPrice) +
          v.purchased * Utils.priceDecimal(v.purchasedPrice)),
      0,
    );
  }
}

function upsertOrderToPrisma(o: Order): any {
  return {
    id: o.id,
    quantity: o.quantity,
    year: parseInt(o.year),
    deficit: o.debt,
    businessUnitId: o.businessUnitId,
    status: o.status,
  };
}

function prismaToOrder(orders: OrdersModel[]): Order[] {
  return orders.map(
    (o) =>
      new Order(
        o.id,
        o.quantity,
        o.year.toString(),
        o.businessUnitId,
        OrderStatus[o.status],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        o.reservations.map(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (r) =>
            new Reservation(
              r.id,
              o.id,
              r.vintage,
              r.reservationForYear,
              r.quantity,
              r.stockId,
            ),
        ) ?? [],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        o.executions ?? [],
      ),
  );
}
