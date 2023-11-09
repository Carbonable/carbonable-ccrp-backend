import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
  Company,
} from '../../business-unit';
import {
  OrderBookRepositoryInterface,
  StockRepositoryInterface,
} from '../../order-book';
import { Allocation } from '../allocation';
import { VisualizationRepositoryInterface } from '../visualization-repositoy.interface';
import { NetZeroStockExtractor } from './net-zero-stock-extractor';
import { VisualizationStrategyInterface } from './visualization-strategy.interface';

export class NetZeroVisualizationStrategy
  implements VisualizationStrategyInterface
{
  constructor(
    private readonly repository: VisualizationRepositoryInterface,
    private readonly stockRepository: StockRepositoryInterface,
    private readonly orderRepository: OrderBookRepositoryInterface,
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly extractor: NetZeroStockExtractor = new NetZeroStockExtractor(),
  ) {}

  async clean(
    company: Company,
    businessUnit: BusinessUnit,
    allocation: Allocation,
  ): Promise<void> {
    await this.repository.delete(`NET-ZERO#COMPANY#${company.id}`);
    await this.repository.delete(`NET-ZERO#BUSINESSUNIT#${businessUnit.id}`);
    await this.repository.delete(`NET-ZERO#PROJECT#${allocation.projectId}`);
  }

  async hydrate(
    company: Company,
    businessUnit: BusinessUnit,
    allocation: Allocation,
  ): Promise<void> {
    // company wide find stock associated with company busines unit ids
    await this.hydrateCompanyWideData(company.id);
    // business unit wide find stock associated with businessunit id
    await this.hydrateBusinessUnitWideData(businessUnit);
    // project wide find stock associated with project id
    await this.hydrateProjectWideData(allocation.projectId);
  }

  async hydrateProjectWideData(projectId: string) {
    const stock = await this.stockRepository.findProjectStock(projectId);
    let visualization = this.extractor.extract(stock);
    const actuals =
      await this.orderRepository.getProjectYearlyEffectiveCompensation(
        projectId,
      );
    visualization = this.extractor.aggregate(visualization, [], actuals);

    await this.repository.put(
      `NET-ZERO#PROJECT#${projectId}`,
      JSON.stringify(visualization),
    );
  }

  async hydrateBusinessUnitWideData(businessUnit: BusinessUnit) {
    const stock = await this.stockRepository.findBusinessUnitStock(
      businessUnit.id,
    );
    let visualization = this.extractor.extract(stock);

    const actuals =
      await this.orderRepository.getBusinessUnitYearlyEffectiveCompensation(
        businessUnit.id,
      );
    const demands = businessUnit.getDemands();
    visualization = this.extractor.aggregate(visualization, demands, actuals);

    await this.repository.put(
      `NET-ZERO#BUSINESSUNIT#${businessUnit.id}`,
      JSON.stringify(visualization),
    );
  }

  async hydrateCompanyWideData(companyId: string) {
    const stock = await this.stockRepository.findCompanyStock(companyId);
    let visualization = this.extractor.extract(stock);
    const actuals =
      await this.orderRepository.getCompanyYearlyEffectiveCompensation(
        companyId,
      );
    // get business units
    const businessUnits = await this.businessUnitRepository.byCompanyId(
      companyId,
    );

    const demands = Company.mergeDemands(businessUnits);

    visualization = this.extractor.aggregate(visualization, demands, actuals);

    await this.repository.put(
      `NET-ZERO#COMPANY#${companyId}`,
      JSON.stringify(visualization),
    );
    throw new Error('Method not implemented.');
  }
}
