import {
  Company,
  BusinessUnit,
  BusinessUnitRepositoryInterface,
} from '../../business-unit';
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
import { VisualizationDataExtractor } from './visualization-data-extractor';

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
    private readonly visualizationDataExtractor: VisualizationDataExtractor,
    private readonly repository: VisualizationRepositoryInterface,
    private readonly stockRepository: StockRepositoryInterface,
    private readonly orderRepository: OrderBookRepositoryInterface,
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly extractor: AnnualPlanningStockExtractor = new AnnualPlanningStockExtractor(),
  ) {}

  async clean(allocationIds: string[]): Promise<void> {
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchCompanies(allocationIds),
      async (c) =>
        await this.repository.delete(
          cumulativePlanningKey({ companyId: c.id }),
        ),
    );
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchBusinessUnits(allocationIds),
      async (bu) =>
        await this.repository.delete(
          cumulativePlanningKey({ businessUnitId: bu.id }),
        ),
    );
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchProjects(allocationIds),
      async (p) =>
        await this.repository.delete(
          cumulativePlanningKey({ projectId: p.id }),
        ),
    );
  }

  async hydrate(allocationIds: string[]): Promise<void> {
    // company wide find stock associated with company busines unit ids
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchCompanies(allocationIds),
      async (c) => await this.hydrateCompanyWideData(c),
    );
    // business unit wide find stock associated with businessunit id
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchBusinessUnits(allocationIds),
      async (bu) => await this.hydrateBusinessUnitWideData(bu),
    );
    // project wide find stock associated with project id
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchProjects(allocationIds),
      async (p) => await this.hydrateProjectWideData(p.id),
    );
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
