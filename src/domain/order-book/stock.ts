import { IdGeneratorInterface } from '../common';
import { Vintage } from '../portfolio';

export const exPostStockAvailable = (
  stocks: Stock[],
  currentYear: number,
): number =>
  stocks.reduce(
    (acc, curr) =>
      acc + (parseInt(curr.vintage) <= currentYear ? curr.available : 0),
    0,
  );
// FIX: exAnteStock should not include purchased stock
export const exAnteStockAvailable = (
  stocks: Stock[],
  currentYear: number,
): number =>
  stocks.reduce(
    (acc, curr) =>
      acc + (parseInt(curr.vintage) > currentYear ? curr.available : 0),
    0,
  );
export const exPostStock = (stocks: Stock[], currentYear: number): number =>
  stocks.reduce(
    (acc, curr) =>
      acc +
      (parseInt(curr.vintage) <= currentYear
        ? curr.quantity + curr.purchased
        : 0),
    0,
  );
export const exAnteStock = (stocks: Stock[], currentYear: number): number =>
  stocks.reduce(
    (acc, curr) =>
      acc + (parseInt(curr.vintage) > currentYear ? curr.quantity : 0),
    0,
  );

export type StockAvailability = {
  percentage: number;
  units: number;
};

export class Stock {
  private _consumed = 0;
  private _available = 0;
  private _retired = 0;

  constructor(
    public readonly id: string,
    public readonly businessUnitId: string = null,
    public readonly projectId: string,
    public readonly vintage: string,
    private _quantity: number,
    private _allocationId: string = null,
    private _purchased: number = 0,
    private _purchasedPrice: number = 0,
    private _issuedPrice: number = 0,
  ) {
    this._available = _quantity + _purchased;
    this._consumed = 0;
  }

  lock(count: number): void {
    this._available -= count;
    this._consumed += count;
  }

  // TODO: Add check into this method
  retire(count: number): void {
    this._retired += count;
  }

  get allocationId(): string {
    return this._allocationId;
  }
  get quantity(): number {
    return this._quantity;
  }
  set quantity(quantity: number) {
    this._quantity = quantity;
  }
  get available(): number {
    return this._available;
  }
  get consumed(): number {
    return this._consumed;
  }
  get retired(): number {
    return this._retired;
  }
  get purchased(): number {
    return this._purchased;
  }
  get issued(): number {
    return this._quantity;
  }
  get purchasedPrice(): number {
    return this._purchasedPrice;
  }
  get issuedPrice(): number {
    return this._issuedPrice;
  }
  static fromVintages(
    idGenerator: IdGeneratorInterface,
    projectId: string,
    vintages: Vintage[],
  ): Stock[] {
    return vintages.map((v) => {
      const stock = new Stock(
        idGenerator.generate(),
        null,
        projectId,
        v.year,
        v.issued,
        null,
        v.purchased,
        v.purchasePrice,
        v.issuedPrice,
      );
      stock.lock(v.reserved);
      return stock;
    });
  }
}
