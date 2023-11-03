export class CreateForecastedEmissionsResponse {
  constructor(
    public readonly id: string,
    public readonly errors: Array<string> = [],
  ) {}
}
