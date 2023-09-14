import { Order } from '.';

export interface OrderBookRepositoryInterface {
  listOrdersFor(id: string): Promise<Array<Order>>;
  save(orders: Array<Order>): Promise<void>;
}
