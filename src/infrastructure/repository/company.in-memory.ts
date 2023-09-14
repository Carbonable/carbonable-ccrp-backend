import {
  Company,
  CompanyRepositoryInterface,
} from '../../domain/business-unit';

export class InMemoryCompanyRepository implements CompanyRepositoryInterface {
  constructor(private readonly companies: Company[] = []) {}
  async byId(id: string): Promise<Company> {
    return this.companies.find((company) => company.id === id);
  }

  async save(company: Company): Promise<void> {
    this.companies.push(company);
  }
}
