import { Company } from './company';

export interface CompanyRepositoryInterface {
  byId(id: string): Promise<Company>;
  save(company: Company): Promise<void>;
}

