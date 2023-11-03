import { IdGeneratorInterface } from '../common';
import { TON_IN_GRAM } from '../order-book';
import { AbsorptionCurve } from './carbon-credit';

export class Vintage {
  private _capacity: number;
  private _reserved: number;
  private _available: number;

  constructor(
    public readonly id: string,
    public readonly year: string,
    capacity: number,
  ) {
    this._reserved = 0;
    this._available = capacity;
    this._capacity = capacity;
  }

  get capacity(): number {
    this.checkCapacity();
    return this._available;
  }
  set capacity(value: number) {
    this.checkCapacity();
    this._capacity += value;
    this._available += value;
    this.checkCapacity();
  }

  lock(count = 0): void {
    this.checkCapacity();
    this._reserved += count;
    this._available -= count;
    this.checkCapacity();
  }

  // Ensure our business domain obect cannot enter an invalid state.
  private checkCapacity(): void {
    if (this._available + this._reserved !== this._capacity) {
      throw new Error('Failed to verify capacity');
    }
  }

  static async buildFromAbsorptionCurve(
    idGenerator: IdGeneratorInterface,
    absorptionCurve: AbsorptionCurve,
  ): Promise<Vintage[]> {
    let ccs = [];
    let absDiff = 0;
    for (const point of absorptionCurve) {
      const date = new Date(point.timestamp * 1000);
      const vintage = date.getFullYear().toString();
      const toGenerate = Math.ceil((point.absorption - absDiff) / TON_IN_GRAM);
      ccs = [...ccs, new Vintage(idGenerator.generate(), vintage, toGenerate)];

      absDiff = point.absorption;
    }

    return ccs;
  }
}
