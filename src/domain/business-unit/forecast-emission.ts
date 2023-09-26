export class ForecastEmission {
  constructor(
    public readonly year: number,
    public readonly emission: number,
    public readonly id: string = null,
  ) {}
}
