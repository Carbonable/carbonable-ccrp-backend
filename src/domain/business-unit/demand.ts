import Utils from '../../utils';

export class Demand {
  constructor(
    public readonly year: string,
    public readonly target: number,
    public readonly emission: number,
  ) {}

  static default(): Demand {
    return new Demand('0', 0, 0);
  }

  targetInTon(): number {
    return this.emission * (this.target / 100);
  }

  compensationRate(retired: number): number {
    return Utils.round((retired / this.emission) * 100) ?? 0;
  }
}
