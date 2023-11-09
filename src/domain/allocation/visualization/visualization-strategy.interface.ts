import { BusinessUnit, Company } from '../../business-unit';
import { Allocation } from '../allocation';

export interface VisualizationStrategyInterface {
  clean(
    company: Company,
    businessUnit: BusinessUnit,
    allocation: Allocation,
  ): Promise<void>;
  hydrate(
    company: Company,
    businessUnit: BusinessUnit,
    allocation: Allocation,
  ): Promise<void>;
}
