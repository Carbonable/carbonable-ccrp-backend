export class Stock {
  private _consumed: number;
  private _available: number;

  constructor(
    public readonly id: string,
    public readonly businessUnitId: string,
    public readonly projectId: string,
    public readonly vintage: string,
    private _quantity: number,
    private _allocationId: string = null,
  ) {
    this._available = _quantity;
    this._consumed = 0;
  }

  lock(count: number): void {
    this._available -= count;
    this._consumed += count;
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
}
