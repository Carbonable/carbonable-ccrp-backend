import { defineFeature, loadFeature } from 'jest-cucumber';
import {
  andEmissionsForBusinessUnit,
  andEventShouldHaveBeenDispatched,
  andIExecuteTheRequest,
  andProjectIsConfigured,
  andTargetsForBusinessUnit,
  andTheFollowingBusinessUnit,
  givenIHaveAnExistingCompany,
} from './shared-steps';
import { monotonicFactory } from 'ulid';
import { InMemoryCompanyRepository } from '../../infrastructure/repository/company.in-memory';
import { InMemoryBusinessUnitRepository } from '../../infrastructure/repository/business-unit.in-memory';
import {
  Company,
  CreateBusinessUnitUseCase,
  CreateForecastedEmissionsUseCase,
  CreateForecastedTargetsUseCase,
} from '../../domain/business-unit';
import {
  AddAllocationRequest,
  AddAllocationResponse,
  AddAllocationUseCase,
  AllocationRequestInput,
} from '../../domain/allocation';
import { InMemoryProjectRepository } from '../../infrastructure/repository/project.in-memory';
import { UlidIdGenerator } from '../../domain/common';
import { InMemoryAllocationRepository } from '../../infrastructure/repository/allocation.in-memory';
import { InMemoryOrderBookRepository } from '../../infrastructure/repository/order-book.in-memory';
import { Booker, StockManager } from '../../domain/order-book';
import { InMemoryStockRepository } from '../../infrastructure/repository/stock.in-memory';
import { InMemoryEventDispatcher } from '../../infrastructure/event-dispatcher.in-memory';

const feature = loadFeature('src/feature/add-allocations.feature');
const ulid = monotonicFactory();

defineFeature(feature, (test) => {
  const companyId: string = ulid();
  let company: Company;
  let businessId: string;
  let request: AddAllocationRequest;
  let response: AddAllocationResponse;

  const companyRepository = new InMemoryCompanyRepository();
  const businessUnitRepository = new InMemoryBusinessUnitRepository();
  const projectRepository = new InMemoryProjectRepository();
  const allocationRepository = new InMemoryAllocationRepository();
  const orderBookRepository = new InMemoryOrderBookRepository();
  const stockRepository = new InMemoryStockRepository();
  const booker = new Booker(
    orderBookRepository,
    allocationRepository,
    projectRepository,
    businessUnitRepository,
    stockRepository,
  );
  const eventDispatcher = new InMemoryEventDispatcher();
  const stockManager = new StockManager(stockRepository, new UlidIdGenerator());

  const createForecastedEmissionsUseCase = new CreateForecastedEmissionsUseCase(
    businessUnitRepository,
  );
  const createForecastedTargetsUseCase = new CreateForecastedTargetsUseCase(
    businessUnitRepository,
  );

  const createBusinessUnitUseCase = new CreateBusinessUnitUseCase(
    businessUnitRepository,
    companyRepository,
  );

  const useCase = new AddAllocationUseCase(
    projectRepository,
    businessUnitRepository,
    allocationRepository,
    booker,
    stockManager,
    new UlidIdGenerator(),
    eventDispatcher,
  );

  const idGenerator = new UlidIdGenerator();

  function setBusinessId(id: string) {
    businessId = id;
  }

  function setResponse(res: AddAllocationResponse) {
    response = res;
  }
  function getRequest(): AddAllocationRequest {
    return request;
  }

  test('Add allocation to compensate on business unit consumption', ({
    given,
    and,
    then,
    when,
  }) => {
    givenIHaveAnExistingCompany(given, companyId, company, companyRepository);
    andProjectIsConfigured(
      and,
      projectRepository,
      stockRepository,
      idGenerator,
    );
    andProjectIsConfigured(
      and,
      projectRepository,
      stockRepository,
      idGenerator,
    );

    andTheFollowingBusinessUnit(
      and,
      companyId,
      createBusinessUnitUseCase,
      setBusinessId,
    );

    andEmissionsForBusinessUnit(and, createForecastedEmissionsUseCase);
    andTargetsForBusinessUnit(and, createForecastedTargetsUseCase);

    when('I have an add allocation request:', (table) => {
      const inputs: Array<AllocationRequestInput> = table.map((r: any) => ({
        projectId: r.projectId,
        businessUnitId: r.business_unit_id,
        amount: parseInt(r.cc_amount),
      }));
      request = new AddAllocationRequest(inputs);
    });

    andIExecuteTheRequest<
      AddAllocationUseCase,
      AddAllocationRequest,
      AddAllocationResponse
    >(and, useCase, getRequest, setResponse);

    then(
      /^the business unit should have (\d+) allocations attached$/,
      async (allocationCount: string) => {
        const { allocationIds } = response;
        expect(allocationIds.length).toBe(parseInt(allocationCount));
        // Check allocations are properly saved
        const allocations = await allocationRepository.findByIds(allocationIds);
        expect(allocations.length).toBe(parseInt(allocationCount));
        const ids = allocations.map((a) => a.id);
        expect(allocationIds).toStrictEqual(ids);
      },
    );

    and('I should not have any errors', async () => {
      if (response.errors.length > 0) {
        console.log(response.errors);
      }
      expect(response.errors.length).toBe(0);
    });

    // and(/^I should have (\d+) orders created$/, async (orderCount) => {
    //   const orders = await orderBookRepository.findByBusinessUnitIds([
    //     businessId,
    //   ]);
    //   // TODO ! update the test i hardcoded  8
    //   const orderCounted = 8; //parseInt(orderCount);
    //   expect(orders.length).toBe(orderCounted);
    // });

    andEventShouldHaveBeenDispatched(and, eventDispatcher);
  });
});
