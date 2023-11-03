import { Demand, ForecastEmission, ForecastTarget } from '.';
import { Metadata } from '../common/metadata-parser';
import { CreateBusinessUnitRequest } from './create-business-unit.request';

export class BusinessUnit {
  private forecastEmissions: Array<ForecastEmission> = [];
  private forecastTargets: Array<ForecastTarget> = [];

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly defaultEmission: number,
    public readonly defaultTarget: number,
    public readonly debt: number,
    public readonly companyId: string,
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

  getDemands(): Array<Demand> {
    return this.forecastEmissions.reduce((acc, curr) => {
      const target = this.forecastTargets.find((t) => t.year === curr.year);
      const demand = new Demand(
        curr.year.toString(),
        target?.target || this.defaultTarget,
        curr.emission,
      );
      return [...acc, demand];
    }, []);
  }

  getMetatada(): Array<Metadata<string, string>> {
    return this.metadata;
  }

  static fromRequest(request: CreateBusinessUnitRequest): BusinessUnit {
    return new BusinessUnit(
      request.id,
      request.name,
      request.description,
      request.forecastEmission,
      request.target,
      request.debt,
      request.companyId,
      request.metadata,
    );
  }
}
