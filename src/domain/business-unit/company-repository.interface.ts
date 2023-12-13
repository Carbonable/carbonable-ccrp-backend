import { Company } from './company';

export const COMPANY_REPOSITORY = 'COMPANY_REPOSITORY';
export interface CompanyRepositoryInterface {
  byId(id: string): Promise<Company>;
  save(company: Company): Promise<void>;
  byName(name: string): Promise<Company>;
  byBusinessUnitId(id: string): Promise<Company>;
  byAllocationIds(ids: string[]): Promise<Company[]>;
}
