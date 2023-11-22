import { Company, BusinessUnit } from '../../business-unit';
import { StockRepositoryInterface } from '../../order-book';
import { Allocation } from '../allocation';
import { VisualizationRepositoryInterface } from '../visualization-repositoy.interface';
import { FinancialAnalysisExtractor } from './financial-analysis-extractor';
import { financialAnalysisKey } from './utils';
import { VisualizationStrategyInterface } from './visualization-strategy.interface';

export class FinancialAnalysisVisualizationStrategy
  implements VisualizationStrategyInterface
{
  constructor(
    private readonly repository: VisualizationRepositoryInterface,
    private readonly stockRepository: StockRepositoryInterface,
    private readonly extractor: FinancialAnalysisExtractor = new FinancialAnalysisExtractor(),
  ) {}

  async clean(
    company: Company,
    businessUnit: BusinessUnit,
    allocation: Allocation,
  ): Promise<void> {
    await this.repository.delete(
      financialAnalysisKey({ companyId: company.id }),
    );
    await this.repository.delete(
      financialAnalysisKey({ businessUnitId: businessUnit.id }),
    );
    await this.repository.delete(
      financialAnalysisKey({ projectId: allocation.projectId }),
    );
  }

  async hydrate(
    company: Company,
    businessUnit: BusinessUnit,
    allocation: Allocation,
  ): Promise<void> {
    await this.hydrateCompanyWideData(company);
    await this.hydrateBusinessWideData(businessUnit);
    await this.hydrateProjectWideData(allocation.projectId);
  }

  async hydrateCompanyWideData(company: Company) {
    const stock = await this.stockRepository.findCompanyStock(company.id);
    const visualization = this.extractor.extract(stock);
    await this.repository.put(
      financialAnalysisKey({ companyId: company.id }),
      JSON.stringify(visualization),
    );
  }

  async hydrateBusinessWideData(businessUnit: BusinessUnit) {
    const stock = await this.stockRepository.findBusinessUnitStock(
      businessUnit.id,
    );
    const visualization = this.extractor.extract(stock);
    await this.repository.put(
      financialAnalysisKey({ businessUnitId: businessUnit.id }),
      JSON.stringify(visualization),
    );
  }

  async hydrateProjectWideData(projectId: string) {
    const stock = await this.stockRepository.findProjectStock(projectId);
    const visualization = this.extractor.extract(stock);
    await this.repository.put(
      financialAnalysisKey({ projectId }),
      JSON.stringify(visualization),
    );
  }
}
