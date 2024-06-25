import { Reservation, Stock } from '../../order-book';
import { AnnualPlanningStockExtractor } from './annual-planning-stock-extractor';

describe('AnnualPlanningStockExtractor', () => {
  let extractor: AnnualPlanningStockExtractor;

  beforeAll(() => {
    // Mock date to avoid issues with those tests over time
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 11, 10));
  });

  beforeEach(() => {
    extractor = new AnnualPlanningStockExtractor();
  });

  it('should extract nothing if nothing is provided', () => {
    const visualization = extractor.extract([], [], []);
    expect(visualization).toEqual([]);
  });
  it('should extract only with stock and default other data', () => {
    const stocks = [
      new Stock(
        '1',
        'businessUnit1',
        'project1',
        '2023',
        10,
        'allocationId1',
        5,
      ),
      new Stock('2', 'businessUnit1', 'project1', '2024', 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10),
    ];
    const visualization = extractor.extract(stocks, [], []);
    expect(visualization.length).toBe(3);
    expect(visualization[0].exPostStock).toBe(15);
    expect(visualization[1].exPostStock).toBe(25);
    expect(visualization[2].exPostStock).toBe(35);
  });

  it('should take in account retired', () => {
    const stocks = [
      new Stock(
        '1',
        'businessUnit1',
        'project1',
        '2023',
        10,
        'allocationId1',
        5,
      ),
      new Stock('2', 'businessUnit1', 'project1', '2024', 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10),
    ];
    const reservations = [
      new Reservation('1', '1', '2023', '2025', 5, '1'),
      new Reservation('1', '1', '2024', '2025', 5, '2'),
      new Reservation('1', '1', '2025', '2025', 5, '3'),
    ];

    const visualization = extractor.extract(stocks, [], reservations);
    expect(visualization.length).toBe(3);
    expect(visualization[0].exPostRetired).toBe(0);
    expect(visualization[1].exPostRetired).toBe(0);
    expect(visualization[2].exPostRetired).toBe(15);
  });

  afterAll(() => jest.useRealTimers());
});
