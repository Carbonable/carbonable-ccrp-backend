import { Order, OrderBookRepositoryInterface } from '../../domain/order-book';

export class InMemoryOrderBookRepository
  implements OrderBookRepositoryInterface
{
  constructor(private readonly orders: Order[] = []) {}

  async listOrdersFor(id: string): Promise<Array<Order>> {
    return this.orders.filter((order) => order.businessUnitId === id);
  }
  async save(orders: Order[]): Promise<void> {
    orders.forEach((order) => this.orders.push(order));
  }
}
