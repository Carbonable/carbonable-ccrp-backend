import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
} from '../../domain/business-unit';

export class InMemoryBusinessUnitRepository
  implements BusinessUnitRepositoryInterface
{
  constructor(private readonly inner: Array<BusinessUnit> = []) {}

  async byId(id: string): Promise<BusinessUnit> {
    return this.inner.find((bu) => bu.id === id);
  }

  async byCompanyId(companyId: string): Promise<BusinessUnit[]> {
    return this.inner.filter((bu) => bu.companyId === companyId);
  }

  async save(businessUnit: BusinessUnit): Promise<void> {
    this.inner.push(businessUnit);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async byAllocationIds(ids: string[]): Promise<BusinessUnit[]> {
    throw new Error('Method not supported');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async byAllocatedProjects(projectId: string): Promise<BusinessUnit[]> {
    throw new Error('Method not supported');
  }
}
