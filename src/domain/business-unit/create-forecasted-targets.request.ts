import { ForecastTarget } from './forecast-target';

export class CreateForecastedTargetsRequest {
  constructor(
    public readonly businessUnitId: string,
    public readonly forecastTargets: Array<ForecastTarget>,
  ) {}
}
