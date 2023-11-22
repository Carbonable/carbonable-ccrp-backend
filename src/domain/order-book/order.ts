import { Execution, Reservation, Stock } from '.';
import { IdGeneratorInterface } from '../common';

export enum OrderStatus {
  OPEN = 'OPEN',
  PENDING = 'PARTIAL',
  CLOSED = 'CLOSED',
}

export class Order {
  private _debt = 0;
  constructor(
    public readonly id: string,
    private _quantity: number,
    public readonly year: string,
    public readonly businessUnitId: string,
    private _status: OrderStatus,
    private _reservations: Array<Reservation>,
    private _executions: Array<Execution>,
  ) {}

  async reserve(
    idGenerator: IdGeneratorInterface,
    vintage: string,
    stock: Stock,
  ): Promise<void> {
    const actualQuantity =
      this._quantity -
      this._reservations.reduce((acc, curr) => acc + curr.count, 0);

    if (actualQuantity <= 0 || stock.available <= 0) {
      return;
    }

    if (actualQuantity > stock.available) {
      this._reservations.push(
        new Reservation(
          idGenerator.generate(),
          this.id,
          vintage,
          stock.available,
          stock.id,
        ),
      );
      return;
    }

    this._reservations.push(
      new Reservation(
        idGenerator.generate(),
        this.id,
        vintage,
        actualQuantity,
        stock.id,
      ),
    );

    return;
  }

  get debt(): number {
    return this._debt;
  }

  get quantity(): number {
    return this._quantity;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get actualRate(): number {
    if (0 === this._quantity) return 0;

    const reserved = this._executions.reduce(
      (acc, curr) => acc + curr.count,
      0,
    );
    return (reserved / this.quantity) * 100;
  }

  get reservations(): Array<Reservation> {
    return this._reservations;
  }

  get executions(): Array<Execution> {
    return this._executions;
  }

  static default(): Order {
    return new Order('0', 0, '0', '0', OrderStatus.OPEN, [], []);
  }
}
