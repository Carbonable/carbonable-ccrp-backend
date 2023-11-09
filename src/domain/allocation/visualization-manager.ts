import {
  BusinessUnitRepositoryInterface,
  CompanyRepositoryInterface,
} from '../business-unit';
import { AllocationRepositoryInterface } from './allocation-repository.interface';
import { VisualizationRepositoryInterface } from './visualization-repositoy.interface';
import { VisualizationStrategyInterface } from './visualization/visualization-strategy.interface';

export class VisualizationManager {
  constructor(
    private readonly repository: VisualizationRepositoryInterface,
    private readonly allocationRepository: AllocationRepositoryInterface,
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly companyRepository: CompanyRepositoryInterface,
    private strategies: VisualizationStrategyInterface[],
  ) {}

  async flushExcept(ids: string[]): Promise<void> {
    const allocations = await this.allocationRepository.findByIds(ids);
    for (const allocation of allocations) {
      const businessUnit = await this.businessUnitRepository.byId(
        allocation.businessUnitId,
      );
      const company = await this.companyRepository.byBusinessUnitId(
        businessUnit.id,
      );

      await Promise.all(
        this.strategies.map((s) => s.clean(company, businessUnit, allocation)),
      );
    }
  }

  async hydrateVisualization(ids: string[]): Promise<void> {
    const allocations = await this.allocationRepository.findByIds(ids);
    for (const allocation of allocations) {
      const businessUnit = await this.businessUnitRepository.byId(
        allocation.businessUnitId,
      );
      const company = await this.companyRepository.byBusinessUnitId(
        businessUnit.id,
      );

      await Promise.all(
        this.strategies.map((s) =>
          s.hydrate(company, businessUnit, allocation),
        ),
      );
    }
  }
}
