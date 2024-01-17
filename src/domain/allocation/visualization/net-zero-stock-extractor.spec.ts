import { Demand } from '../../business-unit';
import { EffectiveCompensation, Stock } from '../../order-book';
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
        exAnteCount: 40,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
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
        exAnteCount: 40,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
      },
      {
        vintage: '2021',
        exPostCount: 20,
        exAnteCount: 30,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
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
        exAnteCount: 40,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
      },
      {
        vintage: '2021',
        exPostCount: 20,
        exAnteCount: 30,
        emission: 0,
        target: 0,
        actual: 0,
        retired: 0,
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
    expect(visualization[0].actual).toBe(50);
    expect(visualization[1].actual).toBe(60);
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
    expect(visualization[1].actual).toBe(60);
    expect(visualization[0].target).toBe(0);
    expect(visualization[1].target).toBe(60);
  });

  it('should take retired in account', () => {
    let stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2022', 10),
      new Stock('2', 'businessUnit1', 'project1', '2023', 10),
      new Stock('3', 'businessUnit1', 'project1', '2025', 10),
    ];
    stocks = stocks.map((s) => {
      s.lock(10);
      return s;
    });
    const visualizationData = extractor.extract(stocks);

    expect(visualizationData.length).toBe(3);
    expect(visualizationData[0].retired).toBe(10);
    expect(visualizationData[1].retired).toBe(20);
    expect(visualizationData[2].retired).toBe(30);
  });

  afterAll(() => jest.useRealTimers());
});
