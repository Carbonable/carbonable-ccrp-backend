import { InMemoryAllocationRepository } from '../../infrastructure/repository/allocation.in-memory';
import { InMemoryBusinessUnitRepository } from '../../infrastructure/repository/business-unit.in-memory';
import { InMemoryOrderBookRepository } from '../../infrastructure/repository/order-book.in-memory';
import { InMemoryProjectRepository } from '../../infrastructure/repository/project.in-memory';
import { InMemoryStockRepository } from '../../infrastructure/repository/stock.in-memory';
import { Allocation, AllocationRepositoryInterface } from '../allocation';
import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
  ForecastEmission,
  ForecastTarget,
} from '../business-unit';
import { UlidIdGenerator } from '../common';
import { ProjectRepositoryInterface } from '../portfolio';
import { Booker } from './booker';
import { OrderStatus } from './order';
import { OrderBookRepositoryInterface } from './order-book.repository';
import { Stock } from './stock';
import { StockRepositoryInterface } from './stock.repository';

describe('Booker', () => {
  let booker: Booker;
  let orderRepository: InMemoryOrderBookRepository;
  let allocationRepository: InMemoryAllocationRepository;
  let projectRepository: InMemoryProjectRepository;
  let businessUnitRepository: InMemoryBusinessUnitRepository;
  let stockRepository: InMemoryStockRepository;

  beforeEach(() => {
    const businessUnit1 = createBusinessUnit('1');
    const allocation = createAllocation(100);
    [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      orderRepository,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      allocationRepository,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      projectRepository,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      businessUnitRepository,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      stockRepository,
    ] = createRepositories({
      businessUnit: [businessUnit1],
      allocation: [allocation],
    });
    booker = configureBooker(
      orderRepository,
      allocationRepository,
      projectRepository,
      businessUnitRepository,
      stockRepository,
    );
  });

  it('should do nothing as there is no stock', async () => {
    try {
      await booker.placeOrders(['allocationId1']);
    } catch (e) {
      console.log(e);
    }
    // using js to access private property
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(orderRepository.orders.length).toBe(0);
  });

  it('should place orders for years with a target set', async () => {
    await stockRepository.save(createStock('projectId1'));
    await booker.placeOrders(['allocationId1']);
    // using js to access private property
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(orderRepository.orders.length).toBe(11);
    // using js to access private property
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orders = orderRepository.orders;
    for (const o of orders) {
      expect(o.status).toBe(OrderStatus.OPEN);
    }
    for (let i = 0; i < 11; i++) {
      expect(orders[i].year).toBe((2026 + i).toString());
    }
    // NOTE: check that the quantity match the demand
    // see configureBooker for demand reference
    expect(orders[0].quantity).toBe(60000);
    expect(orders[1].quantity).toBe(60000);
    expect(orders[2].quantity).toBe(60000);
    expect(orders[3].quantity).toBe(60000);
    expect(orders[4].quantity).toBe(60000);
    expect(orders[5].quantity).toBe(120000);
    expect(orders[6].quantity).toBe(177000);
    expect(orders[7].quantity).toBe(232000);
    expect(orders[8].quantity).toBe(285000);
    expect(orders[9].quantity).toBe(560000);
    expect(orders[10].quantity).toBe(550000);
  });

  it('should place orders for years with a target set and stock available', async () => {
    // NOTE: stock is limited in this dataset and we only have 100 units per vintage
    await stockRepository.save(createStock('projectId1'));
    await booker.placeOrders(['allocationId1']);
    // using js to access private property
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orders = orderRepository.orders;

    // NOTE: only first order should have reservations because we allocated 100 % of the stock to fullfill it
    //TODO : recheck tests
    expect(orders[0].reservations.length).toBe(4);
    expect(orders[1].reservations.length).toBe(1);
    for (let i = 2; i < 10; i++) {
      expect(orders[i].reservations.length).toBe(0);
    }
    for (const r of orders[0].reservations) {
      expect(r.reservedFor).toBe(orders[0].year);
    }
  });

  it('should place orders with the correct amount of reservations - single stock', async () => {
    // NOTE: we create one big stock with enough cc to fullfill all demands
    await stockRepository.save(createStock('projectId1', 1, 2224000));
    await booker.placeOrders(['allocationId1']);
    // using js to access private property
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orders = orderRepository.orders;

    // NOTE: all orders should have one reservation of the required quantity
    for (let i = 0; i < 10; i++) {
      expect(orders[i].reservations.length).toBe(1);
    }
    for (const o of orders) {
      for (const r of o.reservations) {
        expect(r.reservedFor).toBe(o.year);
        expect(r.count).toBe(o.quantity);
      }
    }
  });

  it('should place orders with the correct amount of reservations - multiple stock', async () => {
    // NOTE: we create one big stock with enough cc to fullfill all demands
    await stockRepository.save(createStock('projectId1', 4, 556000));
    await booker.placeOrders(['allocationId1']);
    // using js to access private property
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const orders = orderRepository.orders;

    // NOTE: some year will have one reservations whereas some will have two spanned over two stocks
    expect(orders[0].reservations.length).toBe(1);
    expect(orders[0].reservations[0].count).toBe(60000);

    expect(orders[1].reservations.length).toBe(1);
    expect(orders[1].reservations[0].count).toBe(60000);
    expect(orders[1].reservations[0].stockId).toBe('stockId1');

    expect(orders[2].reservations.length).toBe(1);
    expect(orders[2].reservations[0].count).toBe(60000);
    expect(orders[2].reservations[0].stockId).toBe('stockId1');

    expect(orders[3].reservations.length).toBe(1);
    expect(orders[3].reservations[0].count).toBe(60000);
    expect(orders[3].reservations[0].stockId).toBe('stockId1');

    expect(orders[4].reservations.length).toBe(1);
    expect(orders[4].reservations[0].count).toBe(60000);
    expect(orders[4].reservations[0].stockId).toBe('stockId1');

    expect(orders[5].reservations.length).toBe(1);
    expect(orders[5].reservations[0].count).toBe(120000);
    expect(orders[5].reservations[0].stockId).toBe('stockId1');

    expect(orders[6].reservations.length).toBe(2);
    expect(orders[6].reservations[0].count).toBe(136000);
    expect(orders[6].reservations[0].stockId).toBe('stockId1');
    expect(orders[6].reservations[1].count).toBe(41000);
    expect(orders[6].reservations[1].stockId).toBe('stockId2');

    expect(orders[7].reservations.length).toBe(1);
    expect(orders[7].reservations[0].count).toBe(232000);
    expect(orders[7].reservations[0].stockId).toBe('stockId2');

    expect(orders[8].reservations.length).toBe(2);
    expect(orders[8].reservations[0].count).toBe(283000);
    expect(orders[8].reservations[0].stockId).toBe('stockId2');
    expect(orders[8].reservations[1].count).toBe(2000);
    expect(orders[8].reservations[1].stockId).toBe('stockId3');

    expect(orders[9].reservations.length).toBe(2);
    expect(orders[9].reservations[0].count).toBe(554000);
    expect(orders[9].reservations[0].stockId).toBe('stockId3');
    expect(orders[9].reservations[1].count).toBe(6000);
    expect(orders[9].reservations[1].stockId).toBe('stockId4');

    expect(orders[10].reservations.length).toBe(1);
    expect(orders[10].reservations[0].count).toBe(550000);
    expect(orders[10].reservations[0].stockId).toBe('stockId4');
  });
});

function createBusinessUnit(id: string): BusinessUnit {
  // Configure first business unit
  const targets = [
    new ForecastTarget(2022, 600000),
    new ForecastTarget(2023, 600000),
    new ForecastTarget(2024, 600000),
    new ForecastTarget(2025, 600000),
    new ForecastTarget(2026, 600000),
    new ForecastTarget(2027, 600000),
    new ForecastTarget(2028, 600000),
    new ForecastTarget(2029, 600000),
    new ForecastTarget(2030, 600000),
    new ForecastTarget(2031, 600000),
    new ForecastTarget(2032, 590000),
    new ForecastTarget(2033, 580000),
    new ForecastTarget(2034, 570000),
    new ForecastTarget(2035, 560000),
    new ForecastTarget(2036, 550000),
  ];
  const emissions = [
    new ForecastEmission(2022, 0),
    new ForecastEmission(2023, 0),
    new ForecastEmission(2024, 0),
    new ForecastEmission(2025, 0),
    new ForecastEmission(2026, 10),
    new ForecastEmission(2027, 10),
    new ForecastEmission(2028, 10),
    new ForecastEmission(2029, 10),
    new ForecastEmission(2030, 10),
    new ForecastEmission(2031, 20),
    new ForecastEmission(2032, 30),
    new ForecastEmission(2033, 40),
    new ForecastEmission(2034, 50),
    new ForecastEmission(2035, 100),
    new ForecastEmission(2036, 100),
  ];
  const businessUnit1 = new BusinessUnit(
    `businessUnit${id}`,
    'company1',
    'name1',
    0,
    0,
    0,
    'companyId1',
    [],
  );
  businessUnit1.addTargets(targets);
  businessUnit1.addForecastEmissions(emissions);
  return businessUnit1;
}

function createAllocation(amount: number): Allocation {
  return new Allocation(
    'allocationId1',
    'projectId1',
    'businessUnit1',
    amount,
    new Date(),
  );
}

function createStock(
  projectId: string,
  stockCount = 5,
  itemUnits = 100,
): Stock[] {
  const stock = [];
  for (let i = 0; i < stockCount; i++) {
    stock.push(
      new Stock(
        `stockId${i + 1}`,
        'businessUnit1',
        projectId,
        (2022 + i).toString(),
        itemUnits,
        'allocationId1',
        0,
        0,
        0,
      ),
    );
  }
  return stock;
}

function createRepositories(data: any) {
  return [
    new InMemoryOrderBookRepository(),
    new InMemoryAllocationRepository(data?.allocation),
    new InMemoryProjectRepository(),
    new InMemoryBusinessUnitRepository(data?.businessUnit),
    new InMemoryStockRepository(),
  ];
}

function configureBooker(
  order: OrderBookRepositoryInterface,
  allocation: AllocationRepositoryInterface,
  project: ProjectRepositoryInterface,
  businessUnit: BusinessUnitRepositoryInterface,
  stock: StockRepositoryInterface,
): Booker {
  return new Booker(
    order,
    allocation,
    project,
    businessUnit,
    stock,
    new UlidIdGenerator(),
  );
}
