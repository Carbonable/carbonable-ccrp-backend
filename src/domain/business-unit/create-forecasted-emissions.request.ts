import { ForecastEmission } from '.';

export class CreateForecastedEmissionsRequest {
  constructor(
    public readonly businessUnitId: string,
    public readonly forecastEmissions: Array<ForecastEmission>,
  ) {}
}
