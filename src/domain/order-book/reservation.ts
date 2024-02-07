export class Reservation {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly vintage: string,
    public readonly reservedFor: string,
    public readonly count: number,
    public readonly stockId: string,
  ) {}
}
