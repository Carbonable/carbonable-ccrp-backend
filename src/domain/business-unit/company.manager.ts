import { CompanyRepositoryInterface } from './company-repository.interface';

export class CompanyManager {
  constructor(private readonly repository: CompanyRepositoryInterface) {}

  async byId(id: string) {
    return await this.repository.byId(id);
  }
}
