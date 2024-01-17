import { Stock, exAnteStock, exPostStock } from './stock';

describe('Stock', () => {
  it('should work with quantity', () => {
    const stock = new Stock('1', 'businessUnit1', 'project1', '2023', 10);
    expect(stock.purchased).toBe(0);
    expect(stock.quantity).toBe(10);
    expect(stock.available).toBe(10);
  });

  it('should work with purchased', () => {
    const stock = new Stock(
      '1',
      'businessUnit1',
      'project1',
      '2023',
      0,
      null,
      10,
    );

    expect(stock.purchased).toBe(10);
    expect(stock.quantity).toBe(0);
    expect(stock.available).toBe(10);
  });

  it('should work with purchased', () => {
    const stock = new Stock(
      '1',
      'businessUnit1',
      'project1',
      '2023',
      10,
      null,
      10,
    );

    expect(stock.purchased).toBe(10);
    expect(stock.quantity).toBe(10);
    expect(stock.available).toBe(20);
  });

  it('should compute exAnteStock', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2022', 10),
      new Stock('1', 'businessUnit1', 'project1', '2023', 10),
      new Stock('1', 'businessUnit1', 'project1', '2024', 10),
      new Stock('1', 'businessUnit1', 'project1', '2025', 10),
    ];

    expect(exAnteStock(stocks, 2022)).toBe(40);
    expect(exAnteStock(stocks, 2023)).toBe(30);
    expect(exAnteStock(stocks, 2024)).toBe(20);
    expect(exAnteStock(stocks, 2025)).toBe(10);
  });

  it('should compute exPostStock', () => {
    const stocks = [
      new Stock('1', 'businessUnit1', 'project1', '2022', 10),
      new Stock('1', 'businessUnit1', 'project1', '2023', 10),
      new Stock('1', 'businessUnit1', 'project1', '2024', 10),
      new Stock('1', 'businessUnit1', 'project1', '2025', 10),
    ];

    expect(exPostStock(stocks, 2022)).toBe(0);
    expect(exPostStock(stocks, 2023)).toBe(10);
    expect(exPostStock(stocks, 2024)).toBe(20);
    expect(exPostStock(stocks, 2025)).toBe(30);
  });
});
