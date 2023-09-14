import { ForecastEmission, ForecastTarget } from '.';
import { Metadata } from '../common/metadata-parser';
import { CreateBusinessUnitRequest } from './create-business-unit.request';

export class BusinessUnit {
  private forecastEmissions: Array<ForecastEmission> = [];
  private forecastTargets: Array<ForecastTarget> = [];

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly forecastEmission: number,
    public readonly target: number,
    public readonly debt: number,
    private metadata: Array<Metadata<string, string>>,
  ) {}

  addForecastEmissions(emissions: ForecastEmission[]): void {
    this.forecastEmissions = emissions;
  }

  getForecastEmissions(): Array<ForecastEmission> {
    return this.forecastEmissions;
  }

  addTargets(targets: ForecastTarget[]): void {
    this.forecastTargets = targets;
  }

  getTargets(): Array<ForecastTarget> {
    return this.forecastTargets;
  }

  static fromRequest(request: CreateBusinessUnitRequest): BusinessUnit {
    return new BusinessUnit(
      request.id,
      request.name,
      request.description,
      request.forecastEmission,
      request.target,
      request.debt,
      request.metadata,
    );
  }
}
