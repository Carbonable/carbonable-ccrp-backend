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
}
