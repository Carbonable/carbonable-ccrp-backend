import { InMemoryStockRepository } from '../../infrastructure/repository/stock.in-memory';
import { StockManager } from './stock-manager';
import { UlidIdGenerator } from '../common';
import { Allocation } from '../allocation';
import { Project, Vintage } from '../portfolio';
import { BusinessUnit } from '../business-unit';
import { Stock } from './stock';

describe('StockManager', () => {
  let stockRepository: InMemoryStockRepository;
  let stockManager: StockManager;

  beforeEach(() => {
    stockRepository = new InMemoryStockRepository();
    stockManager = new StockManager(stockRepository, new UlidIdGenerator());
  });

  it('should do nothing with no stock', () => {
    const allocation = new Allocation(
      'allocationId1',
      'projectId1',
      'businessUnitId1',
      100,
    );
    const project = new Project('projectId1', 'Decarb project ', '1', [], []);
    const businessUnit = new BusinessUnit(
      '1',
      'BusinessUnit1',
      '1',
      0,
      0,
      0,
      '1',
      [],
    );

    stockManager.createStockFor(allocation, project, businessUnit);

    expect(stockRepository.stock.length).toBe(0);
  });

  it('should lock all stock when allocation is 100%', async () => {
    const { allocation, project, businessUnit } = await setupData(
      stockRepository,
      100,
      100,
    );
    await stockManager.createStockFor(allocation, project, businessUnit);

    const stocksLocked = stockRepository.stock;
    expect(stockRepository.stock.length).toBe(2);
    expect(stocksLocked[0].quantity).toBe(100);
    expect(stocksLocked[0].available).toBe(0);
    expect(stocksLocked[0].consumed).toBe(100);
    expect(stocksLocked[1].quantity).toBe(100);
    expect(stocksLocked[1].available).toBe(100);
    expect(stocksLocked[1].consumed).toBe(0);
  });

  it('should lock stock when allocation is 50%', async () => {
    const { allocation, project, businessUnit } = await setupData(
      stockRepository,
      50,
      100,
    );
    await stockManager.createStockFor(allocation, project, businessUnit);

    const stocksLocked = stockRepository.stock;
    expect(stockRepository.stock.length).toBe(2);
    expect(stocksLocked[0].quantity).toBe(100);
    expect(stocksLocked[0].available).toBe(50);
    expect(stocksLocked[0].consumed).toBe(50);
    expect(stocksLocked[1].quantity).toBe(50);
    expect(stocksLocked[1].available).toBe(50);
    expect(stocksLocked[1].consumed).toBe(0);
  });

  it('should lock stock when allocation is 10%', async () => {
    const { allocation, project, businessUnit } = await setupData(
      stockRepository,
      10,
      100,
    );
    await stockManager.createStockFor(allocation, project, businessUnit);

    const stocksLocked = stockRepository.stock;
    expect(stockRepository.stock.length).toBe(2);
    expect(stocksLocked[0].quantity).toBe(100);
    expect(stocksLocked[0].available).toBe(90);
    expect(stocksLocked[0].consumed).toBe(10);
    expect(stocksLocked[1].quantity).toBe(10);
    expect(stocksLocked[1].available).toBe(10);
    expect(stocksLocked[1].consumed).toBe(0);
  });
});

async function setupData(
  stockRepository: InMemoryStockRepository,
  allocationAmount: number,
  capacity: number,
): Promise<{
  allocation: Allocation;
  project: Project;
  businessUnit: BusinessUnit;
}> {
  const allocation = new Allocation(
    'allocationId1',
    'projectId1',
    'businessUnitId1',
    allocationAmount,
  );
  const project = new Project(
    'projectId1',
    'Decarb project ',
    '1',
    [],
    [new Vintage('vintageId1', '2023', capacity, 0, 0, 11)],
  );
  const businessUnit = new BusinessUnit(
    '1',
    'BusinessUnit1',
    '1',
    0,
    0,
    0,
    '1',
    [],
  );

  // creating stock from project vintages
  const stocks = Stock.fromVintages(
    new UlidIdGenerator(),
    project.id,
    project.vintages,
  );
  await stockRepository.save(stocks);

  // checking we get correct stock after hydratation
  expect(stockRepository.stock.length).toBe(1);
  expect(stocks[0].quantity).toBe(capacity);
  expect(stocks[0].available).toBe(capacity);
  expect(stocks[0].consumed).toBe(0);
  return { allocation, project, businessUnit };
}
