export class Execution {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly count: number,
    public readonly executionDate: Date,
  ) {}
}
