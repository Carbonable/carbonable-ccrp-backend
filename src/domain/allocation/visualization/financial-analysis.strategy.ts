import { Company, BusinessUnit } from '../../business-unit';
import { StockRepositoryInterface } from '../../order-book';
import { VisualizationRepositoryInterface } from '../visualization-repositoy.interface';
import { FinancialAnalysisExtractor } from './financial-analysis-extractor';
import { financialAnalysisKey } from './utils';
import { VisualizationDataExtractor } from './visualization-data-extractor';
import { VisualizationStrategyInterface } from './visualization-strategy.interface';

export class FinancialAnalysisVisualizationStrategy
  implements VisualizationStrategyInterface
{
  constructor(
    private readonly visualizationDataExtractor: VisualizationDataExtractor,
    private readonly repository: VisualizationRepositoryInterface,
    private readonly stockRepository: StockRepositoryInterface,
    private readonly extractor: FinancialAnalysisExtractor = new FinancialAnalysisExtractor(),
  ) {}

  async clean(allocationIds: string[]): Promise<void> {
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchCompanies(allocationIds),
      async (c) =>
        await this.repository.delete(financialAnalysisKey({ companyId: c.id })),
    );
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchBusinessUnits(allocationIds),
      async (bu) =>
        await this.repository.delete(
          financialAnalysisKey({ businessUnitId: bu.id }),
        ),
    );
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchProjects(allocationIds),
      async (p) =>
        await this.repository.delete(financialAnalysisKey({ projectId: p.id })),
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
      async (bu) => await this.hydrateBusinessWideData(bu),
    );
    // project wide find stock associated with project id
    this.visualizationDataExtractor.iterateOverData(
      await this.visualizationDataExtractor.fetchProjects(allocationIds),
      async (p) => await this.hydrateProjectWideData(p.id),
    );
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
