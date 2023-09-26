import { defineFeature, loadFeature } from 'jest-cucumber';
import {
  andIExecuteTheRequest,
  andTheFollowingBusinessUnit,
  givenIHaveAnExistingCompany,
} from './shared-steps';
import { monotonicFactory } from 'ulid';
import { InMemoryCompanyRepository } from '../../infrastructure/repository/company.in-memory';
import { InMemoryBusinessUnitRepository } from '../../infrastructure/repository/business-unit.in-memory';
import {
  Company,
  CreateBusinessUnitUseCase,
  CreateForecastedEmissionsResponse,
  CreateForecastedEmissionsUseCase,
  CreateForecastedEmissionsRequest,
} from '../../domain/business-unit';

const feature = loadFeature('src/feature/create-forecasted-emissions.feature');
const ulid = monotonicFactory();

defineFeature(feature, (test) => {
  const companyId: string = ulid();
  let businessId: string;
  let company: Company;
  let request: CreateForecastedEmissionsRequest;
  let response: CreateForecastedEmissionsResponse;
  const companyRepository = new InMemoryCompanyRepository();
  const businessUnitRepository = new InMemoryBusinessUnitRepository();
  const createBusinessUnitUseCase = new CreateBusinessUnitUseCase(
    businessUnitRepository,
    companyRepository,
  );
  const useCase = new CreateForecastedEmissionsUseCase(businessUnitRepository);
  function setBusinessId(id: string) {
    businessId = id;
  }

  function setResponse(res: CreateForecastedEmissionsResponse) {
    response = res;
  }
  function getRequest(): CreateForecastedEmissionsRequest {
    return request;
  }

  test('Create forecasted emissions for a given business unit', ({
    given,
    and,
    then,
    when,
  }) => {
    givenIHaveAnExistingCompany(given, companyId, company, companyRepository);
    andTheFollowingBusinessUnit(
      and,
      companyId,
      createBusinessUnitUseCase,
      setBusinessId,
    );

    when('I have a new forecasted emission request:', (table) => {
      request = new CreateForecastedEmissionsRequest(businessId, table);
    });

    andIExecuteTheRequest<
      CreateForecastedEmissionsUseCase,
      CreateForecastedEmissionsRequest,
      CreateForecastedEmissionsResponse
    >(and, useCase, getRequest, setResponse);

    then(
      'I business unit should have forecasted emissions configured:',
      async (table) => {
        const businessUnitId = response.id;
        const businessUnit = await businessUnitRepository.byId(businessUnitId);
        const emissions = businessUnit.getForecastEmissions();

        for (const index in table) {
          expect(emissions[index].year).toEqual(table[index].year);
          expect(emissions[index].quantity).toEqual(table[index].quantity);
        }
        expect(emissions.length).toEqual(3);
      },
    );
  });
});
