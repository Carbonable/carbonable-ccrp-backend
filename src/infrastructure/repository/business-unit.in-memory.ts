import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
} from '../../domain/business-unit';

export class InMemoryBusinessUnitRepository
  implements BusinessUnitRepositoryInterface
{
  constructor(private readonly inner: Array<BusinessUnit> = []) {}

  async byId(id: string): Promise<BusinessUnit> {
    return this.inner.find((businessUnit) => businessUnit.id === id);
  }

  async save(businessUnit: BusinessUnit): Promise<void> {
    this.inner.push(businessUnit);
  }
}
