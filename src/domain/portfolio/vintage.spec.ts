import { Vintage } from './vintage';

describe('Vintage', () => {
  it('should work with quantity', () => {
    const vintage = new Vintage('1', '2022', 10, 0, 0, 0);
    expect(vintage.purchased).toBe(0);
    expect(vintage.capacity).toBe(10);
    expect(vintage.available).toBe(10);
  });

  it('should work with purchased', () => {
    const vintage = new Vintage('1', '2022', 0, 10, 0, 0);
    expect(vintage.purchased).toBe(10);
    expect(vintage.capacity).toBe(0);
    expect(vintage.available).toBe(10);
  });

  it('should work with both', () => {
    const vintage = new Vintage('1', '2022', 10, 10, 0, 0);
    expect(vintage.purchased).toBe(10);
    expect(vintage.capacity).toBe(10);
    expect(vintage.available).toBe(20);
  });
});
