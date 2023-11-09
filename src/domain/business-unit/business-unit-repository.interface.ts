import { BusinessUnit } from '.';

export interface BusinessUnitRepositoryInterface {
  byId(id: string): Promise<BusinessUnit>;
  byCompanyId(companyId: string): Promise<BusinessUnit[]>;
  save(businessUnit: BusinessUnit): Promise<void>;
}
