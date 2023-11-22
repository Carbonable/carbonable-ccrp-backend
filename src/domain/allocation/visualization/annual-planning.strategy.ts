import {
  Company,
  BusinessUnit,
  BusinessUnitRepositoryInterface,
} from '../../business-unit';
import { Allocation } from '../allocation';
import { annualPlanningKey } from './utils';
import { VisualizationRepositoryInterface } from '../visualization-repositoy.interface';
import { VisualizationStrategyInterface } from './visualization-strategy.interface';
import {
  OrderBookRepositoryInterface,
  StockRepositoryInterface,
} from '../../order-book';
import { AnnualPlanningStockExtractor } from './annual-planning-stock-extractor';

export class AnnualPlanningVisualizationStrategy
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
    await this.repository.delete(annualPlanningKey({ companyId: company.id }));
    await this.repository.delete(
      annualPlanningKey({ businessUnitId: businessUnit.id }),
    );
    await this.repository.delete(
      annualPlanningKey({ projectId: allocation.projectId }),
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
    throw new Error('Method not implemented.');
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
