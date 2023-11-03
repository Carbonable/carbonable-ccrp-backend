export class CreateForecastedTargetsResponse {
  constructor(
    public readonly id: string,
    public readonly errors: Array<string> = [],
  ) {}
}
