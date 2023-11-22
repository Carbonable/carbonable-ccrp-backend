export class Demand {
  constructor(
    public readonly year: string,
    public readonly target: number,
    public readonly emission: number,
  ) {}

  static default(): Demand {
    return new Demand('0', 0, 0);
  }
}
