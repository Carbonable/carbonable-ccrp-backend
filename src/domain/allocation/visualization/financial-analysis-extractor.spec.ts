import { Stock } from '../../order-book';
import {
  FinancialAnalysisExtractor,
  avg,
} from './financial-analysis-extractor';

describe('FiancialAnalysisExtractor', () => {
  let extractor: FinancialAnalysisExtractor;
  beforeEach(() => {
    extractor = new FinancialAnalysisExtractor();
  });

  it('should avg correctly', () => {
    expect(avg([0, 0, 0])).toEqual(0);
    expect(avg([10, 0])).toEqual(10);
    expect(avg([10, 10])).toEqual(10);
    expect(avg([10, 10, 10])).toEqual(10);
    expect(avg([10, 20])).toEqual(15);
  });

  it('should extract nothing if nothing is provided', () => {
    const visualization = extractor.extract([], [], []);
    expect(visualization).toEqual([]);
  });

  it('should extract financial analysis data for issued cc', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2023', 10),
      new Stock('2', 'businessUnit1', 'project1', '2024', 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10),
    ];
    const visualization = extractor.extract(stocks, [], []);
    expect(visualization.length).toEqual(3);
    expect(visualization[0].year).toEqual('2023');
    expect(visualization[1].year).toEqual('2024');
    expect(visualization[2].year).toEqual('2025');
    // prices not set -> values = 0
    for (const v of visualization) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { year, ...values } = v;
      Object.values(values).forEach((v) => expect(v).toEqual(0));
    }
  });

  it('should extract financial analysis data for issued cc with prices set', () => {
    const stocks = [
      new Stock(
        '1',
        'businessUnit1',
        'project1',
        '2023',
        10,
        null,
        null,
        null,
        1000,
      ),
      new Stock(
        '2',
        'businessUnit1',
        'project1',
        '2024',
        10,
        null,
        null,
        null,
        1000,
      ),
      new Stock(
        '3',
        'businessUnit1',
        'project1',
        '2025',
        10,
        null,
        null,
        null,
        1000,
      ),
    ];
    const visualization = extractor.extract(stocks, [], []);

    expect(visualization.length).toEqual(3);
    expect(visualization[0].year).toEqual('2023');
    expect(visualization[1].year).toEqual('2024');
    expect(visualization[2].year).toEqual('2025');
    // check prices
    expect(visualization[0].avgIssuedPrice).toEqual(10);
    expect(visualization[0].totalIssuedAmount).toEqual(100);
    expect(visualization[0].allTimeAvgIssuedPrice).toEqual(10);

    expect(visualization[1].avgIssuedPrice).toEqual(10);
    expect(visualization[1].totalIssuedAmount).toEqual(100);
    expect(visualization[1].allTimeAvgIssuedPrice).toEqual(10);

    expect(visualization[2].avgIssuedPrice).toEqual(10);
    expect(visualization[2].totalIssuedAmount).toEqual(100);
    expect(visualization[2].allTimeAvgIssuedPrice).toEqual(10);
  });

  it('should extract financial analysis data for purchased cc with prices set', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2023', 0, null, 10, 1000),
      new Stock('2', 'businessUnit1', 'project1', '2024', 0, null, 10, 1000),
      new Stock('3', 'businessUnit1', 'project1', '2025', 0, null, 10, 1000),
    ];
    const visualization = extractor.extract(stocks, [], []);
    expect(visualization.length).toEqual(3);
    expect(visualization[0].year).toEqual('2023');
    expect(visualization[1].year).toEqual('2024');
    expect(visualization[2].year).toEqual('2025');
    // check prices
    expect(visualization[0].avgPurchasedPrice).toEqual(10);
    expect(visualization[0].totalPurchasedAmount).toEqual(100);
    expect(visualization[0].allTimeAvgPurchasedPrice).toEqual(10);

    expect(visualization[1].avgPurchasedPrice).toEqual(10);
    expect(visualization[1].totalPurchasedAmount).toEqual(100);
    expect(visualization[1].allTimeAvgPurchasedPrice).toEqual(10);

    expect(visualization[2].avgPurchasedPrice).toEqual(10);
    expect(visualization[2].totalPurchasedAmount).toEqual(100);
    expect(visualization[2].allTimeAvgPurchasedPrice).toEqual(10);
  });

  it('should extract financial analysis data for both issued and purchased cc with prices set', () => {
    const stocks = [
      new Stock(
        '1',
        'businessUnit1',
        'project1',
        '2023',
        10,
        null,
        10,
        1000,
        1000,
      ),
      new Stock(
        '2',
        'businessUnit1',
        'project1',
        '2024',
        10,
        null,
        10,
        1000,
        1000,
      ),
      new Stock(
        '3',
        'businessUnit1',
        'project1',
        '2025',
        10,
        null,
        10,
        1000,
        1000,
      ),
    ];
    const visualization = extractor.extract(stocks, [], []);
    expect(visualization.length).toEqual(3);
    expect(visualization[0].year).toEqual('2023');
    expect(visualization[1].year).toEqual('2024');
    expect(visualization[2].year).toEqual('2025');

    // check prices
    expect(visualization[0].avgPurchasedPrice).toEqual(10);
    expect(visualization[0].totalPurchasedAmount).toEqual(100);
    expect(visualization[0].allTimeAvgPurchasedPrice).toEqual(10);
    expect(visualization[0].avgIssuedPrice).toEqual(10);
    expect(visualization[0].totalIssuedAmount).toEqual(100);
    expect(visualization[0].allTimeAvgIssuedPrice).toEqual(10);
    expect(visualization[0].avgPrice).toEqual(10);
    expect(visualization[0].allTimeAvgPrice).toEqual(10);

    expect(visualization[1].avgPurchasedPrice).toEqual(10);
    expect(visualization[1].totalPurchasedAmount).toEqual(100);
    expect(visualization[1].allTimeAvgPurchasedPrice).toEqual(10);
    expect(visualization[1].avgIssuedPrice).toEqual(10);
    expect(visualization[1].totalIssuedAmount).toEqual(100);
    expect(visualization[1].allTimeAvgIssuedPrice).toEqual(10);
    expect(visualization[1].avgPrice).toEqual(10);
    expect(visualization[1].allTimeAvgPrice).toEqual(10);

    expect(visualization[2].avgPurchasedPrice).toEqual(10);
    expect(visualization[2].totalPurchasedAmount).toEqual(100);
    expect(visualization[2].allTimeAvgPurchasedPrice).toEqual(10);
    expect(visualization[2].avgIssuedPrice).toEqual(10);
    expect(visualization[2].totalIssuedAmount).toEqual(100);
    expect(visualization[2].allTimeAvgIssuedPrice).toEqual(10);
    expect(visualization[2].avgPrice).toEqual(10);
    expect(visualization[2].allTimeAvgPrice).toEqual(10);
  });

  it('should group stocks by year', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2023', 10),
      new Stock('2', 'businessUnit1', 'project1', '2023', 10),
      new Stock('3', 'businessUnit1', 'project1', '2023', 10),
      new Stock('4', 'businessUnit1', 'project1', '2024', 10),
      new Stock('5', 'businessUnit1', 'project1', '2024', 10),
      new Stock('6', 'businessUnit1', 'project1', '2024', 10),
      new Stock('7', 'businessUnit1', 'project1', '2025', 10),
      new Stock('8', 'businessUnit1', 'project1', '2025', 10),
      new Stock('9', 'businessUnit1', 'project1', '2025', 10),
      new Stock('10', 'businessUnit1', 'project1', '2025', 10),
      new Stock('11', 'businessUnit1', 'project1', '2025', 10),
    ];
    const visualization = extractor.extract(stocks, [], []);
    expect(visualization.length).toEqual(3);
    expect(visualization[0].year).toEqual('2023');
    expect(visualization[1].year).toEqual('2024');
    expect(visualization[2].year).toEqual('2025');
    // prices not set -> values = 0
    for (const v of visualization) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { year, ...values } = v;
      Object.values(values).forEach((v) => expect(v).toEqual(0));
    }
  });
});
