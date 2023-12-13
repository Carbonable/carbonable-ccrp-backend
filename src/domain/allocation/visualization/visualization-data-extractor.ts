import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
  Company,
  CompanyRepositoryInterface,
} from '../../business-unit';
import { Project, ProjectRepositoryInterface } from '../../portfolio';

export class VisualizationDataExtractor {
  constructor(
    private readonly companyRepository: CompanyRepositoryInterface,
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly projectRepository: ProjectRepositoryInterface,
  ) {}

  async iterateOverData<T>(
    data: T[],
    callback: (item: T) => Promise<void>,
  ): Promise<void> {
    for (const item of data) {
      await callback(item);
    }
  }
  async fetchCompanies(allocationIds: string[]): Promise<Company[]> {
    return await this.companyRepository.byAllocationIds(allocationIds);
  }
  async fetchBusinessUnits(allocationIds: string[]): Promise<BusinessUnit[]> {
    return await this.businessUnitRepository.byAllocationIds(allocationIds);
  }
  async fetchProjects(allocationIds: string[]): Promise<Project[]> {
    return await this.projectRepository.byAllocationIds(allocationIds);
  }
}
