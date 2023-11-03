export class Demand {
  constructor(
    public readonly year: string,
    public readonly target: number,
    public readonly emission: number,
  ) {}
}
