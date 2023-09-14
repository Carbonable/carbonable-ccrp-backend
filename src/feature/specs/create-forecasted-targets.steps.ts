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
  CreateForecastedTargetsUseCase,
  CreateForecastedTargetsRequest,
  CreateForecastedTargetsResponse,
} from '../../domain/business-unit';
import { InMemoryOrderBookRepository } from '../../infrastructure/repository/order-book.in-memory';

const feature = loadFeature('src/feature/create-forecasted-targets.feature');
const ulid = monotonicFactory();

defineFeature(feature, (test) => {
  const companyId: string = ulid();
  let businessId: string;
  let company: Company;
  let request: CreateForecastedTargetsRequest;
  let response: CreateForecastedTargetsResponse;
  const companyRepository = new InMemoryCompanyRepository();
  const businessUnitRepository = new InMemoryBusinessUnitRepository();
  const createBusinessUnitUseCase = new CreateBusinessUnitUseCase(
    businessUnitRepository,
    companyRepository,
  );
  const orderBookRepository = new InMemoryOrderBookRepository();
  const useCase = new CreateForecastedTargetsUseCase(
    businessUnitRepository,
    orderBookRepository,
  );

  function setBusinessId(id: string) {
    businessId = id;
  }
  function setResponse(res: CreateForecastedTargetsResponse) {
    response = res;
  }
  function getRequest(): CreateForecastedTargetsRequest {
    return request;
  }

  test('Create forecasted targets for a given business unit', ({
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
    when('I have a new forecasted target request:', (table) => {
      request = new CreateForecastedTargetsRequest(businessId, table);
    });

    andIExecuteTheRequest<
      CreateForecastedTargetsUseCase,
      CreateForecastedTargetsRequest,
      CreateForecastedTargetsResponse
    >(and, useCase, getRequest, setResponse);

    then(
      'I business unit should have forecasted targets configured:',
      async (table) => {
        const businessUnitId = response.id;
        const businessUnit = await businessUnitRepository.byId(businessUnitId);
        const targets = businessUnit.getTargets();

        expect(targets).toEqual(table);
        expect(targets.length).toEqual(3);
      },
    );

    and(
      /^I should have (\d+) orders in my order book$/,
      async (orderCount: string) => {
        const orders = await orderBookRepository.listOrdersFor(businessId);

        expect(orders.length).toBe(parseInt(orderCount));
      },
    );
  });
});
