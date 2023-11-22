import { Stock } from '../../order-book';
import { FinancialAnalysisExtractor } from './financial-analysis-extractor';

describe('FiancialAnalysisExtractor', () => {
  let extractor: FinancialAnalysisExtractor;
  beforeEach(() => {
    extractor = new FinancialAnalysisExtractor();
  });

  it('should extract nothing if nothing is provided', () => {
    const visualization = extractor.extract([]);
    expect(visualization).toEqual([]);
  });

  it('should extract financial analysis data for issued cc', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2023', 10),
      new Stock('2', 'businessUnit1', 'project1', '2024', 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10),
    ];
    const visualization = extractor.extract(stocks);
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
        10,
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
        10,
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
        10,
      ),
    ];
    const visualization = extractor.extract(stocks);
    expect(visualization.length).toEqual(3);
    expect(visualization[0].year).toEqual('2023');
    expect(visualization[1].year).toEqual('2024');
    expect(visualization[2].year).toEqual('2025');
    // check prices
    expect(visualization[0].issuedPrice).toEqual(10);
    expect(visualization[0].totalIssuedAmount).toEqual(100);
    expect(visualization[0].cumulativeTotalIssuedAmount).toEqual(100);

    expect(visualization[1].issuedPrice).toEqual(10);
    expect(visualization[1].totalIssuedAmount).toEqual(100);
    expect(visualization[1].cumulativeTotalIssuedAmount).toEqual(200);

    expect(visualization[2].issuedPrice).toEqual(10);
    expect(visualization[2].totalIssuedAmount).toEqual(100);
    expect(visualization[2].cumulativeTotalIssuedAmount).toEqual(300);
  });

  it('should extract financial analysis data for purchased cc with prices set', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2023', 0, null, 10, 10),
      new Stock('2', 'businessUnit1', 'project1', '2024', 0, null, 10, 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 0, null, 10, 10),
    ];
    const visualization = extractor.extract(stocks);
    expect(visualization.length).toEqual(3);
    expect(visualization[0].year).toEqual('2023');
    expect(visualization[1].year).toEqual('2024');
    expect(visualization[2].year).toEqual('2025');
    // check prices
    expect(visualization[0].purchasedPrice).toEqual(10);
    expect(visualization[0].totalPurchasedAmount).toEqual(100);
    expect(visualization[0].cumulativeTotalPurchasedAmount).toEqual(100);

    expect(visualization[1].purchasedPrice).toEqual(10);
    expect(visualization[1].totalPurchasedAmount).toEqual(100);
    expect(visualization[1].cumulativeTotalPurchasedAmount).toEqual(200);

    expect(visualization[2].purchasedPrice).toEqual(10);
    expect(visualization[2].totalPurchasedAmount).toEqual(100);
    expect(visualization[2].cumulativeTotalPurchasedAmount).toEqual(300);
  });

  it('should extract financial analysis data for both issued and purchased cc with prices set', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2023', 10, null, 10, 10, 10),
      new Stock('2', 'businessUnit1', 'project1', '2024', 10, null, 10, 10, 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10, null, 10, 10, 10),
    ];
    const visualization = extractor.extract(stocks);
    expect(visualization.length).toEqual(3);
    expect(visualization[0].year).toEqual('2023');
    expect(visualization[1].year).toEqual('2024');
    expect(visualization[2].year).toEqual('2025');

    // check prices
    expect(visualization[0].purchasedPrice).toEqual(10);
    expect(visualization[0].totalPurchasedAmount).toEqual(100);
    expect(visualization[0].cumulativeTotalPurchasedAmount).toEqual(100);
    expect(visualization[0].issuedPrice).toEqual(10);
    expect(visualization[0].totalIssuedAmount).toEqual(100);
    expect(visualization[0].cumulativeTotalIssuedAmount).toEqual(100);
    expect(visualization[0].granTotalAmount).toEqual(200);
    expect(visualization[0].cumulativeGranTotalAmount).toEqual(200);

    expect(visualization[1].purchasedPrice).toEqual(10);
    expect(visualization[1].totalPurchasedAmount).toEqual(100);
    expect(visualization[1].cumulativeTotalPurchasedAmount).toEqual(200);
    expect(visualization[1].issuedPrice).toEqual(10);
    expect(visualization[1].totalIssuedAmount).toEqual(100);
    expect(visualization[1].cumulativeTotalIssuedAmount).toEqual(200);
    expect(visualization[1].granTotalAmount).toEqual(200);
    expect(visualization[1].cumulativeGranTotalAmount).toEqual(400);

    expect(visualization[2].purchasedPrice).toEqual(10);
    expect(visualization[2].totalPurchasedAmount).toEqual(100);
    expect(visualization[2].cumulativeTotalPurchasedAmount).toEqual(300);
    expect(visualization[2].issuedPrice).toEqual(10);
    expect(visualization[2].totalIssuedAmount).toEqual(100);
    expect(visualization[2].cumulativeTotalIssuedAmount).toEqual(300);
    expect(visualization[2].granTotalAmount).toEqual(200);
    expect(visualization[2].cumulativeGranTotalAmount).toEqual(600);
  });

  // TODO: Implement logic for debt calculation
  // it('should calculate emission debt based on orders', () => {});
});
