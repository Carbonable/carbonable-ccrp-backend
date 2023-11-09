import {
  EffectiveCompensation,
  Order,
  OrderBookRepositoryInterface,
  OrderStatus,
} from '../../domain/order-book';
import { PrismaService } from '../prisma.service';

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
      }),
    );
  }

  async findOrderForDemand(
    businessUnitId: string,
    year: string,
  ): Promise<Order> {
    return prismaToOrder(
      await this.prisma.order.findFirst({
        where: { businessUnitId, year: parseInt(year) },
      }),
    ).shift();
  }

  async listOrdersFor(id: string): Promise<Order[]> {
    return prismaToOrder(
      await this.prisma.order.findMany({
        where: { businessUnitId: id },
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
        create: { ...orderToPrisma(order) },
        update: {
          ...orderToPrisma(order),
        },
      });
    }
  }

  async getBusinessUnitYearlyEffectiveCompensation(
    businessUnitId: string,
  ): Promise<EffectiveCompensation[]> {
    const orders = await this.prisma.order.findMany({
      where: { businessUnitId, status: OrderStatus.CLOSED },
    });
    return orders.map(
      (o) => new EffectiveCompensation(o.year.toString(), o.quantity),
    );
  }

  async getCompanyYearlyEffectiveCompensation(
    companyId: string,
  ): Promise<EffectiveCompensation[]> {
    const orders = await this.prisma.order.findMany({
      where: { businessUnit: { companyId }, status: OrderStatus.CLOSED },
    });
    return orders.map(
      (o) => new EffectiveCompensation(o.year.toString(), o.quantity),
    );
  }
  async getProjectYearlyEffectiveCompensation(
    projectId: string,
  ): Promise<EffectiveCompensation[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        businessUnit: { allocations: { some: { projectId } } },
        status: OrderStatus.CLOSED,
      },
    });
    return orders.map(
      (o) => new EffectiveCompensation(o.year.toString(), o.quantity),
    );
  }
}

function orderToPrisma(o: Order): any {
  return {
    id: o.id,
    quantity: o.quantity,
    year: parseInt(o.year),
    deficit: o.debt,
    businessUnitId: o.businessUnitId,
    status: o.status,
  };
}

function prismaToOrder(orders: any): Order[] {
  return orders.map(
    (o) =>
      new Order(
        o.id,
        o.quantity,
        o.year,
        o.businessUnitId,
        o.status,
        o.reservations ?? [],
        o.executions ?? [],
      ),
  );
}
