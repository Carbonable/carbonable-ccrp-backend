import {
  Company,
  CompanyRepositoryInterface,
} from '../../domain/business-unit';

export class InMemoryCompanyRepository implements CompanyRepositoryInterface {
  constructor(private readonly companies: Company[] = []) {}
  async byId(id: string): Promise<Company> {
    return this.companies.find((company) => company.id === id);
  }

  async byName(name: string): Promise<Company> {
    return this.companies.find((company) => company.name === name);
  }

  async save(company: Company): Promise<void> {
    if (!this.companies.includes(company)) {
      this.companies.push(company);
    }
  }

  async byBusinessUnitId(id: string): Promise<Company> {
    return this.companies.find((c) =>
      c.businessUnits.find((bu) => bu.id === id),
    );
  }
}
