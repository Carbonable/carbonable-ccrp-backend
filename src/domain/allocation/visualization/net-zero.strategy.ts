import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
  Company,
} from '../../business-unit';
import {
  OrderBookRepositoryInterface,
  StockRepositoryInterface,
} from '../../order-book';
import { VisualizationRepositoryInterface } from '../visualization-repositoy.interface';
import { NetZeroStockExtractor } from './net-zero-stock-extractor';
import { netZeroKey } from './utils';
import { VisualizationDataExtractor } from './visualization-data-extractor';
import { VisualizationStrategyInterface } from './visualization-strategy.interface';

export class NetZeroVisualizationStrategy
  implements VisualizationStrategyInterface
{
  constructor(
    private readonly visualizationDataExtractor: VisualizationDataExtractor,
    private readonly repository: VisualizationRepositoryInterface,
    private readonly stockRepository: StockRepositoryInterface,
    private readonly orderRepository: OrderBookRepositoryInterface,
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly extractor: NetZeroStockExtractor = new NetZeroStockExtractor(),
  ) {}

  async clean(allocationIds: string[]): Promise<void> {
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchCompanies(allocationIds),
      async (c) =>
        await this.repository.delete(netZeroKey({ companyId: c.id })),
    );
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchBusinessUnits(allocationIds),
      async (bu) =>
        await this.repository.delete(netZeroKey({ businessUnitId: bu.id })),
    );
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchProjects(allocationIds),
      async (p) =>
        await this.repository.delete(netZeroKey({ projectId: p.id })),
    );
  }

  async hydrate(allocationIds: string[]): Promise<void> {
    // company wide find stock associated with company busines unit ids
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchCompanies(allocationIds),
      async (c) => await this.hydrateCompanyWideData(c.id),
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

  async hydrateProjectWideData(projectId: string) {
    const stock = await this.stockRepository.findProjectStock(projectId);
    let visualization = this.extractor.extract(stock);
    const actuals =
      await this.orderRepository.getProjectYearlyEffectiveCompensation(
        projectId,
      );
    visualization = this.extractor.aggregate(visualization, [], actuals);

    await this.repository.put(
      netZeroKey({ projectId }),
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
      netZeroKey({ businessUnitId: businessUnit.id }),
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
      netZeroKey({ companyId }),
      JSON.stringify(visualization),
    );
  }
}
