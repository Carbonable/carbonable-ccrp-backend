import {
  Company,
  BusinessUnit,
  BusinessUnitRepositoryInterface,
} from '../../business-unit';
import { Allocation } from '../allocation';
import { cumulativePlanningKey } from './utils';
import { VisualizationRepositoryInterface } from '../visualization-repositoy.interface';
import { VisualizationStrategyInterface } from './visualization-strategy.interface';
import {
  OrderBookRepositoryInterface,
  StockRepositoryInterface,
} from '../../order-book';
import {
  AnnualPlanningStockExtractor,
  AnnualPlanningVisualization,
} from './annual-planning-stock-extractor';

type CumulativeVisualization = {
  timePeriod: string;
  emissions: number;
  exPostIssued: number;
  exPostPurchased: number;
  exPostRetired: number;
  delta: number;
  debt: number;
};

export class CumulativePlanningVisualizationStrategy
  implements VisualizationStrategyInterface
{
  constructor(
    private readonly repository: VisualizationRepositoryInterface,
    private readonly stockRepository: StockRepositoryInterface,
    private readonly orderRepository: OrderBookRepositoryInterface,
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly extractor: AnnualPlanningStockExtractor = new AnnualPlanningStockExtractor(),
  ) {}

  async clean(
    company: Company,
    businessUnit: BusinessUnit,
    allocation: Allocation,
  ): Promise<void> {
    await this.repository.delete(
      cumulativePlanningKey({ companyId: company.id }),
    );
    await this.repository.delete(
      cumulativePlanningKey({ businessUnitId: businessUnit.id }),
    );
    await this.repository.delete(
      cumulativePlanningKey({ projectId: allocation.projectId }),
    );
  }

  async hydrate(
    company: Company,
    businessUnit: BusinessUnit,
    allocation: Allocation,
  ): Promise<void> {
    await this.hydrateCompanyWideData(company);
    await this.hydrateBusinessUnitWideData(businessUnit);
    await this.hydrateProjectWideData(allocation.projectId);
  }

  async hydrateCompanyWideData(company: Company) {
    const stocks = await this.stockRepository.findCompanyStock(company.id);
    const actuals = await this.orderRepository.getCompanyOrders(company.id);

    const businessUnits = await this.businessUnitRepository.byCompanyId(
      company.id,
    );
    const demands = Company.mergeDemands(businessUnits);

    const visualization = this.extractor.extract(stocks, demands, actuals);
    await this.repository.put(
      cumulativePlanningKey({ companyId: company.id }),
      JSON.stringify(this.cumulate(visualization)),
    );
  }

  async hydrateBusinessUnitWideData(businessUnit: BusinessUnit) {
    const stocks = await this.stockRepository.findBusinessUnitStock(
      businessUnit.id,
    );
    const orders = await this.orderRepository.findByBusinessUnitIds([
      businessUnit.id,
    ]);
    const visualization = this.extractor.extract(
      stocks,
      businessUnit.getDemands(),
      orders,
    );

    await this.repository.put(
      cumulativePlanningKey({ businessUnitId: businessUnit.id }),
      JSON.stringify(this.cumulate(visualization)),
    );
  }

  async hydrateProjectWideData(projectId: string) {
    const stocks = await this.stockRepository.findProjectStock(projectId);
    const orders = await this.orderRepository.getProjectOrders(projectId);
    const visualization = this.extractor.extract(stocks, [], orders);

    await this.repository.put(
      cumulativePlanningKey({ projectId: projectId }),
      JSON.stringify(this.cumulate(visualization)),
    );
  }

  cumulate(
    visualizations: AnnualPlanningVisualization[],
  ): CumulativeVisualization[] {
    return visualizations.reduce((acc, curr) => {
      const last = acc[acc.length - 1];
      if (undefined === last) {
        return [
          {
            timePeriod: curr.timePeriod,
            emissions: curr.emissions,
            exPostIssued: curr.exPostIssued,
            exPostPurchased: curr.exPostPurchased,
            exPostRetired: curr.exPostRetired,
            delta: curr.delta,
            debt: curr.debt,
          },
        ];
      }
      return [
        ...acc,
        {
          timePeriod: curr.timePeriod,
          emissions: last.emissions + curr.emissions,
          exPostIssued: last.expPostIssued + curr.exPostIssued,
          exPostPurchased: last.exPostPurchased + curr.exPostPurchased,
          exPostRetired: last.exPostRetired + curr.exPostRetired,
          delta: last.delta + curr.delta,
          debt: last.deb + curr.debt,
        },
      ];
    }, []);
  }
}
