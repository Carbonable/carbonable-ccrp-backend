import { defineFeature, loadFeature } from 'jest-cucumber';
import {
  Company,
  CompanyManager,
  CreateBusinessUnitRequest,
  CreateBusinessUnitResponse,
  CreateBusinessUnitUseCase,
} from '../../domain/business-unit';
import { monotonicFactory } from 'ulid';
import { InMemoryCompanyRepository } from '../../infrastructure/repository/company.in-memory';
import { InMemoryBusinessUnitRepository } from '../../infrastructure/repository/business-unit.in-memory';
import { givenIHaveAnExistingCompany } from './shared-steps';

const ulid = monotonicFactory();
const feature = loadFeature('src/feature/create-business-unit.feature');

defineFeature(feature, (test) => {
  let company: Company;
  const companyId: string = ulid();
  let businessUnitId: string;
  let request: CreateBusinessUnitRequest;
  let response: CreateBusinessUnitResponse;
  const businessUnitRepository = new InMemoryBusinessUnitRepository();
  const companyRepository = new InMemoryCompanyRepository();
  const useCase = new CreateBusinessUnitUseCase(
    businessUnitRepository,
    companyRepository,
  );
  const companyManager = new CompanyManager(companyRepository);

  test('Create a new business unit', ({ given, and, when, then }) => {
    givenIHaveAnExistingCompany(given, companyId, company, companyRepository);

    and('I have a new business unit input:', (table) => {
      const {
        id,
        name,
        description,
        forecastEmission,
        target,
        debt,
        metadata,
      } = table.shift();
      businessUnitId = id;
      request = new CreateBusinessUnitRequest({
        id,
        name,
        description,
        forecastEmission: parseInt(forecastEmission),
        target: parseInt(target),
        debt: parseInt(debt),
        metadata,
        companyId,
      });
    });

    when('I submit the request', async () => {
      response = await useCase.execute(request);

      expect(response.id).toBe(businessUnitId);
    });

    then(
      /^I should have (\d+) business unit in the company$/,
      async (count) => {
        const company = await companyManager.byId(companyId);
        expect(company.businessUnits).toHaveLength(parseInt(count));
      },
    );
  });
});
