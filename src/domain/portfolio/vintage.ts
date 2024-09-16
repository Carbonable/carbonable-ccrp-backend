import { IdGeneratorInterface } from '../common';
import { TON_IN_GRAM } from '../order-book';
import { AbsorptionCurve } from './carbon-credit';

export const DEFAULT_PURCHASED_PRICE = 22;
export const DEFAULT_ISSUED_PRICE = 22;

export class Vintage {
  private _capacity: number;
  private _reserved: number;
  private _available: number;

  constructor(
    public readonly id: string,
    public readonly year: string,
    capacity: number,
    private _purchased: number = 0,
    private _purchasedPrice: number = DEFAULT_PURCHASED_PRICE,
    private _issuedPrice: number = DEFAULT_ISSUED_PRICE,
  ) {
    this._reserved = 0;
    this._available = capacity + _purchased;
    this._capacity = capacity;

    this._purchasedPrice = _purchasedPrice * 100;
    this._issuedPrice = _issuedPrice * 100;
  }

  get issued(): number {
    this.checkCapacity();
    return this._capacity;
  }
  get capacity(): number {
    this.checkCapacity();
    return this._capacity;
  }

  set capacity(value: number) {
    this.checkCapacity();
    this._capacity += value;
    this._available += value;
    this.checkCapacity();
  }

  get available(): number {
    this.checkCapacity();
    return this._available;
  }

  get reserved(): number {
    return this._reserved;
  }

  lock(count = 0): void {
    this.checkCapacity();
    this._reserved += count;
    this._available -= count;
    this.checkCapacity();
  }

  get purchased(): number {
    return this._purchased;
  }
  get purchasePrice(): number {
    return this._purchasedPrice;
  }
  get issuedPrice(): number {
    return this._issuedPrice;
  }

  static exPostStockAt(
    vintages: Vintage[],
    year: number = new Date().getFullYear(),
  ): number {
    return vintages.reduce(
      (acc, curr) => acc + (parseInt(curr.year) <= year ? curr._available : 0),
      0,
    );
  }
  static exAnteStockAt(
    vintages: Vintage[],
    year: number = new Date().getFullYear(),
  ): number {
    return vintages.reduce(
      (acc, curr) => acc + (parseInt(curr.year) > year ? curr._available : 0),
      0,
    );
  }

  // Ensure our business domain obect cannot enter an invalid state.
  private checkCapacity(): void {
    if (this._available + this._reserved !== this._capacity + this._purchased) {
      throw new Error('Failed to verify capacity');
    }
  }

  static async buildFromAbsorptionCurve(
    idGenerator: IdGeneratorInterface,
    absorptionCurve: AbsorptionCurve,
  ): Promise<Vintage[]> {
    const ccs = [];
    for (const point of absorptionCurve) {
      const date = new Date(point.timestamp * 1000);
      const vintage = date.getFullYear().toString();
      const units = Math.round(point.absorption / TON_IN_GRAM);
      ccs.push(
        new Vintage(
          idGenerator.generate(),
          vintage,
          undefined !== point.issuedPrice ? units : 0,
          undefined !== point.purchasedPrice ? units : 0,
          point.purchasedPrice ?? 0,
          point.issuedPrice ?? 0,
        ),
      );
    }

    return ccs;
  }
}
