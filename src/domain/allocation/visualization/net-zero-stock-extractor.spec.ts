import { Demand } from '../../business-unit';
import { EffectiveCompensation, Reservation, Stock } from '../../order-book';
import { NetZeroStockExtractor } from './net-zero-stock-extractor';

describe('NetZeroStockExtractor', () => {
  let extractor: NetZeroStockExtractor;
  beforeAll(() => {
    // Mock date to avoid issues with those tests over time
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 11, 10));
  });
  beforeEach(() => {
    extractor = new NetZeroStockExtractor();
  });

  it('should create visualization data based on stock', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2023', 10),
      new Stock('2', 'businessUnit1', 'project1', '2024', 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10),
    ];
    const visualizationData = extractor.extract(stocks);

    expect(visualizationData.length).toBe(3);
    expect(visualizationData[0].exAnteCount).toBe(20);
    expect(visualizationData[0].exPostCount).toBe(10);

    expect(visualizationData[1].exAnteCount).toBe(10);
    expect(visualizationData[1].exPostCount).toBe(20);

    expect(visualizationData[2].exAnteCount).toBe(0);
    expect(visualizationData[2].exPostCount).toBe(30);
  });

  it('should aggregate nothing if demands are empty', () => {
    const visualizations = [
      {
        vintage: '2020',
        exPostCount: 10,
        exPostSum: 10,
        exAnteCount: 40,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
        consumed: 0,
      },
    ];
    const res = extractor.aggregate(visualizations, [], []);
    expect(res.length).toBe(1);
    expect(res[0].emission).toBe(0);
    expect(res[0].target).toBe(0);
  });

  it('should aggregate demands', () => {
    const visualizations = [
      {
        vintage: '2020',
        exPostCount: 10,
        exPostSum: 10,
        exAnteCount: 40,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
        consumed: 0,
      },
      {
        vintage: '2021',
        exPostCount: 20,
        exPostSum: 20,
        exAnteCount: 30,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
        consumed: 0,
      },
    ];
    const demands = [
      new Demand('2020', 50, 1000000),
      new Demand('2021', 60, 1000000),
    ];
    const res = extractor.aggregate(visualizations, demands, []);
    expect(res.length).toBe(2);

    expect(res[0].emission).toBe(1000000);
    expect(res[0].target).toBe(50);

    expect(res[1].emission).toBe(1000000);
    expect(res[1].target).toBe(60);
  });

  it('should aggregate actuals', () => {
    const visualizations = [
      {
        vintage: '2020',
        exPostCount: 10,
        exPostSum: 10,
        exAnteCount: 40,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
        consumed: 0,
      },
      {
        vintage: '2021',
        exPostCount: 20,
        exPostSum: 20,
        exAnteCount: 30,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
        consumed: 0,
      },
    ];
    const actuals = [
      new EffectiveCompensation('2020', 50),
      new EffectiveCompensation('2021', 60),
    ];
    const res = extractor.aggregate(visualizations, [], actuals);
    expect(res.length).toBe(2);

    expect(res[0].actual).toBe(0);
    expect(res[1].actual).toBe(0);
  });

  it('should not duplicate vintage', async () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2023', 10),
      new Stock('1', 'businessUnit1', 'project2', '2023', 10),
      new Stock('1', 'businessUnit1', 'project3', '2023', 10),
      new Stock('2', 'businessUnit1', 'project1', '2024', 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10),
    ];
    const demands = [new Demand('2023', 50, 100), new Demand('2024', 60, 100)];
    const actuals = [
      new EffectiveCompensation('2023', 50),
      new EffectiveCompensation('2024', 60),
    ];
    const visualizationData = extractor.extract(stocks);
    const visualization = extractor.aggregate(
      visualizationData,
      demands,
      actuals,
    );

    expect(visualization.length).toBe(3);
    // take consumed into account
    expect(visualization[0].actual).toBe(0);
    expect(visualization[1].actual).toBe(0);
    expect(visualization[0].target).toBe(50);
    expect(visualization[1].target).toBe(60);
  });

  it('should keep track of expost count even if we skip a year', async () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2022', 10),
      new Stock('1', 'businessUnit1', 'project2', '2022', 10),
      new Stock('1', 'businessUnit1', 'project3', '2022', 10),
      new Stock('2', 'businessUnit1', 'project1', '2024', 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10),
    ];
    const demands = [new Demand('2023', 50, 100), new Demand('2024', 60, 100)];
    const actuals = [
      new EffectiveCompensation('2023', 50),
      new EffectiveCompensation('2024', 60),
    ];
    const visualizationData = extractor.extract(stocks);
    const visualization = extractor.aggregate(
      visualizationData,
      demands,
      actuals,
    );

    expect(visualization.length).toBe(3);
    expect(visualization[0].actual).toBe(0);
    expect(visualization[1].actual).toBe(0);
    expect(visualization[0].target).toBe(0);
    expect(visualization[1].target).toBe(60);
  });

  it('should take retired in account', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2022', 10),
      new Stock('2', 'businessUnit1', 'project1', '2023', 10),
      new Stock('3', 'businessUnit1', 'project1', '2024', 10),
      new Stock('4', 'businessUnit1', 'project1', '2025', 10),
      new Stock('5', 'businessUnit1', 'project1', '2026', 10),
      new Stock('6', 'businessUnit1', 'project1', '2027', 10),
      new Stock('7', 'businessUnit1', 'project1', '2028', 10),
      new Stock('8', 'businessUnit1', 'project1', '2029', 10),
      new Stock('9', 'businessUnit1', 'project1', '2030', 10),
      new Stock('10', 'businessUnit1', 'project1', '2031', 10),
    ];
    const reservations = [
      new Reservation('1', 'orderId', '2022', '2026', 10, '1'),
      new Reservation('2', 'orderId', '2023', '2026', 10, '2'),
      new Reservation('3', 'orderId', '2024', '2026', 10, '3'),
      new Reservation('4', 'orderId', '2025', '2026', 10, '4'),
      new Reservation('5', 'orderId', '2026', '2026', 10, '5'),
      new Reservation('6', 'orderId', '2027', '2027', 10, '6'),
      new Reservation('7', 'orderId', '2028', '2028', 10, '7'),
      new Reservation('8', 'orderId', '2029', '2029', 10, '8'),
      new Reservation('9', 'orderId', '2030', '2030', 10, '9'),
      new Reservation('10', 'orderId', '2031', '2031', 10, '10'),
    ];
    const visualizationData = extractor.extract(stocks, reservations);

    expect(visualizationData.length).toBe(10);

    expect(visualizationData[0].exAnteCount).toBe(90);
    expect(visualizationData[0].exPostCount).toBe(10);
    expect(visualizationData[0].retired).toBe(0);
    expect(visualizationData[0].consumed).toBe(0);

    expect(visualizationData[1].exAnteCount).toBe(80);
    expect(visualizationData[1].exPostCount).toBe(20);
    expect(visualizationData[1].retired).toBe(0);
    expect(visualizationData[1].consumed).toBe(0);

    expect(visualizationData[2].exAnteCount).toBe(70);
    expect(visualizationData[2].exPostCount).toBe(30);
    expect(visualizationData[2].retired).toBe(0);
    expect(visualizationData[2].consumed).toBe(0);

    expect(visualizationData[3].exAnteCount).toBe(60);
    expect(visualizationData[3].exPostCount).toBe(40);
    expect(visualizationData[3].retired).toBe(0);
    expect(visualizationData[3].consumed).toBe(0);

    expect(visualizationData[4].exAnteCount).toBe(50);
    expect(visualizationData[4].exPostCount).toBe(50);
    expect(visualizationData[4].retired).toBe(50);
    expect(visualizationData[4].consumed).toBe(50);

    expect(visualizationData[5].exAnteCount).toBe(40);
    expect(visualizationData[5].exPostCount).toBe(10);
    expect(visualizationData[5].retired).toBe(10);
    expect(visualizationData[5].consumed).toBe(60);

    expect(visualizationData[6].exAnteCount).toBe(30);
    expect(visualizationData[6].exPostCount).toBe(10);
    expect(visualizationData[6].retired).toBe(10);
    expect(visualizationData[6].consumed).toBe(70);

    expect(visualizationData[7].exAnteCount).toBe(20);
    expect(visualizationData[7].exPostCount).toBe(10);
    expect(visualizationData[7].retired).toBe(10);
    expect(visualizationData[7].consumed).toBe(80);

    expect(visualizationData[8].exAnteCount).toBe(10);
    expect(visualizationData[8].exPostCount).toBe(10);
    expect(visualizationData[8].retired).toBe(10);
    expect(visualizationData[8].consumed).toBe(90);

    expect(visualizationData[9].exAnteCount).toBe(0);
    expect(visualizationData[9].exPostCount).toBe(10);
    expect(visualizationData[9].retired).toBe(10);
    expect(visualizationData[9].consumed).toBe(100);
  });

  it('should work with duplicated vintages too', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2022', 10),
      new Stock('2', 'businessUnit1', 'project1', '2022', 10),
      new Stock('3', 'businessUnit1', 'project1', '2022', 10),
      new Stock('4', 'businessUnit1', 'project1', '2025', 10),
      new Stock('5', 'businessUnit1', 'project1', '2026', 10),
      new Stock('6', 'businessUnit1', 'project1', '2027', 10),
      new Stock('7', 'businessUnit1', 'project1', '2028', 10),
      new Stock('8', 'businessUnit1', 'project1', '2029', 10),
      new Stock('9', 'businessUnit1', 'project1', '2030', 10),
      new Stock('10', 'businessUnit1', 'project1', '2031', 10),
    ];
    const reservations = [
      new Reservation('1', 'orderId', '2022', '2026', 10, '1'),
      new Reservation('2', 'orderId', '2022', '2026', 10, '2'),
      new Reservation('3', 'orderId', '2022', '2026', 10, '3'),
      new Reservation('4', 'orderId', '2025', '2026', 10, '4'),
      new Reservation('5', 'orderId', '2026', '2026', 10, '5'),
      new Reservation('6', 'orderId', '2027', '2027', 10, '6'),
      new Reservation('7', 'orderId', '2028', '2028', 10, '7'),
      new Reservation('8', 'orderId', '2029', '2029', 10, '8'),
      new Reservation('9', 'orderId', '2030', '2030', 10, '9'),
      new Reservation('10', 'orderId', '2031', '2031', 10, '10'),
    ];
    const visualizationData = extractor.extract(stocks, reservations);

    expect(visualizationData.length).toBe(8);

    expect(visualizationData[0].exAnteCount).toBe(70);
    expect(visualizationData[0].exPostCount).toBe(30);
    expect(visualizationData[0].retired).toBe(0);
    expect(visualizationData[0].consumed).toBe(0);

    expect(visualizationData[1].exAnteCount).toBe(60);
    expect(visualizationData[1].exPostCount).toBe(40);
    expect(visualizationData[1].retired).toBe(0);
    expect(visualizationData[1].consumed).toBe(0);

    expect(visualizationData[2].exAnteCount).toBe(50);
    expect(visualizationData[2].exPostCount).toBe(50);
    expect(visualizationData[2].retired).toBe(50);
    expect(visualizationData[2].consumed).toBe(50);

    expect(visualizationData[3].exAnteCount).toBe(40);
    expect(visualizationData[3].exPostCount).toBe(10);
    expect(visualizationData[3].retired).toBe(10);
    expect(visualizationData[3].consumed).toBe(60);

    expect(visualizationData[4].exAnteCount).toBe(30);
    expect(visualizationData[4].exPostCount).toBe(10);
    expect(visualizationData[4].retired).toBe(10);
    expect(visualizationData[4].consumed).toBe(70);

    expect(visualizationData[5].exAnteCount).toBe(20);
    expect(visualizationData[5].exPostCount).toBe(10);
    expect(visualizationData[5].retired).toBe(10);
    expect(visualizationData[5].consumed).toBe(80);

    expect(visualizationData[6].exAnteCount).toBe(10);
    expect(visualizationData[6].exPostCount).toBe(10);
    expect(visualizationData[6].retired).toBe(10);
    expect(visualizationData[6].consumed).toBe(90);

    expect(visualizationData[7].exAnteCount).toBe(0);
    expect(visualizationData[7].exPostCount).toBe(10);
    expect(visualizationData[7].retired).toBe(10);
    expect(visualizationData[7].consumed).toBe(100);
  });

  afterAll(() => jest.useRealTimers());
});
