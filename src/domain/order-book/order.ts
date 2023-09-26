import { CreateForecastedTargetsRequest } from '../business-unit';

export class Order {
  constructor(
    public readonly id: string,
    public readonly quantity: number,
    public readonly year: number,
    public readonly businessUnitId: string,
    private deficit: number | null = null,
  ) {}

  getDeficit(): number | null {
    return this.deficit;
  }

  static fromTargetsRequest(
    req: CreateForecastedTargetsRequest,
    idGenerator: () => string,
  ): Array<Order> {
    return req.forecastTargets.map(
      (target) =>
        new Order(
          idGenerator(),
          target.target,
          target.year,
          req.businessUnitId,
        ),
    );
  }
}
