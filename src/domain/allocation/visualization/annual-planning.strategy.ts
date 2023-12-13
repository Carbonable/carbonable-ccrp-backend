import {
  Company,
  BusinessUnit,
  BusinessUnitRepositoryInterface,
} from '../../business-unit';
import { annualPlanningKey } from './utils';
import { VisualizationRepositoryInterface } from '../visualization-repositoy.interface';
import { VisualizationStrategyInterface } from './visualization-strategy.interface';
import {
  OrderBookRepositoryInterface,
  StockRepositoryInterface,
} from '../../order-book';
import { AnnualPlanningStockExtractor } from './annual-planning-stock-extractor';
import { VisualizationDataExtractor } from './visualization-data-extractor';

export class AnnualPlanningVisualizationStrategy
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
        await this.repository.delete(annualPlanningKey({ companyId: c.id })),
    );
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchBusinessUnits(allocationIds),
      async (bu) =>
        await this.repository.delete(
          annualPlanningKey({ businessUnitId: bu.id }),
        ),
    );
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchProjects(allocationIds),
      async (p) =>
        await this.repository.delete(annualPlanningKey({ projectId: p.id })),
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
      annualPlanningKey({ companyId: company.id }),
      JSON.stringify(visualization),
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
      annualPlanningKey({ businessUnitId: businessUnit.id }),
      JSON.stringify(visualization),
    );
  }

  async hydrateProjectWideData(projectId: string) {
    const stocks = await this.stockRepository.findProjectStock(projectId);
    const orders = await this.orderRepository.getProjectOrders(projectId);
    const visualization = this.extractor.extract(stocks, [], orders);

    await this.repository.put(
      annualPlanningKey({ projectId: projectId }),
      JSON.stringify(visualization),
    );
  }
}
