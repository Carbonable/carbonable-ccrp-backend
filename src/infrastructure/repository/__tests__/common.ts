import { ulid } from 'ulid';
import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
  Company,
  CompanyRepositoryInterface,
} from '../../../domain/business-unit';
import { Project, ProjectRepositoryInterface } from '../../../domain/portfolio';

let createdCompany: Company = null;

export async function createCompany(
  repository: CompanyRepositoryInterface,
): Promise<Company> {
  if (null === createdCompany) {
    const companyId = ulid().toString();
    const companyData = new Company(companyId, 'Test Carbonable 1');
    await repository.save(companyData);
    createdCompany = companyData;
  }
  return createdCompany;
}

export async function getCarbonableCompany(
  repository: CompanyRepositoryInterface,
): Promise<Company> {
  return await repository.byName('Test Carbonable 1');
}
export async function getLasDelicias(
  repository: ProjectRepositoryInterface,
): Promise<Project> {
  return await getProject(repository, 'Las Delicias');
}
export async function getBanegasFarm(
  repository: ProjectRepositoryInterface,
): Promise<Project> {
  return await getProject(repository, 'Banegas Farm');
}
export async function getProject(
  repository: ProjectRepositoryInterface,
  identifier: string,
): Promise<Project> {
  return await repository.findOneByIdentifier(identifier);
}
export async function createBusinessUnit(
  repository: BusinessUnitRepositoryInterface,
  companyId: string,
): Promise<BusinessUnit> {
  const businessUnitId = ulid().toString();
  const businessUnit = new BusinessUnit(
    businessUnitId,
    'Usine',
    "Coeur de l'activité",
    100,
    50,
    0,
    companyId,
    [
      { key: 'type', value: 'factory' },
      { key: 'location', value: 'Paris' },
      { key: 'color', value: 'red' },
    ],
  );
  await repository.save(businessUnit);
  return businessUnit;
}
export async function createProject(): Promise<Project> {
  return null;
}
