import {
  EffectiveCompensation,
  Order,
  OrderBookRepositoryInterface,
  OrderStatus,
} from '../../domain/order-book';

export class InMemoryOrderBookRepository
  implements OrderBookRepositoryInterface
{
  constructor(private readonly orders: Order[] = []) {}

  async listOrdersFor(id: string): Promise<Array<Order>> {
    return this.orders.filter((order) => order.businessUnitId === id);
  }
  async save(orders: Order[]): Promise<void> {
    orders.forEach((order) => {
      if (this.orders.find((o) => o.id === order.id)) {
        return;
      }
      this.orders.push(order);
    });
  }

  async findByBusinessUnitIds(businessUnitIds: string[]): Promise<Order[]> {
    return this.orders.filter((o) =>
      businessUnitIds.includes(o.businessUnitId),
    );
  }

  async findOrderForDemand(
    businessUnitId: string,
    year: string,
  ): Promise<Order> {
    const filteredOrders = this.orders.filter(
      (o) => businessUnitId === o.businessUnitId && o.year === year,
    );
    if (filteredOrders.length === 0) {
      throw new Error(
        `No order found for businessUnitId ${businessUnitId} and year ${year}`,
      );
    }
    return filteredOrders[0];
  }

  async getBusinessUnitYearlyEffectiveCompensation(
    businessUnitId: string,
  ): Promise<EffectiveCompensation[]> {
    const filtered = this.orders.filter(
      (o) =>
        o.businessUnitId === businessUnitId && o.status === OrderStatus.CLOSED,
    );
    return filtered.map((o) => new EffectiveCompensation(o.year, o.quantity));
  }
  async getCompanyYearlyEffectiveCompensation(
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    companyId: string,
  ): Promise<EffectiveCompensation[]> {
    throw new Error('Operation not supported');
  }
  async getProjectYearlyEffectiveCompensation(
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    projectId: string,
  ): Promise<EffectiveCompensation[]> {
    throw new Error('Operation not supported');
  }

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCompanyOrders(companyId: string): Promise<Order[]> {
    throw new Error('Operation not supported');
  }

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getProjectOrders(projectId: string): Promise<Order[]> {
    throw new Error('Operation not supported');
  }
}
