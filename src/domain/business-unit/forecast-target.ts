export class ForecastTarget {
  constructor(
    public readonly year: number,
    public readonly target: number,
    public readonly id: string = null,
  ) {}
}
