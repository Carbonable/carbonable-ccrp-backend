import { TON_IN_GRAM } from '../order-book';

export enum CarbonCreditType {
  RESTORATION = 'RESTORATION',
  CONCERVATION = 'CONCERVATION',
}

export enum CarbonCreditOrigin {
  FORWARD_FINANCE = 'FORWARD_FINANCE',
  DIRECT_PURCHASE = 'DIRECT_PURCHASE',
}

export type AbsorptionCurve = Array<CurvePoint>;
export type CurvePoint = {
  timestamp: number;
  absorption: number;
  issuedPrice?: number;
  purchasedPrice?: number;
};

export class CarbonCredit {
  constructor(
    public readonly number: string,
    public readonly vintage: string,
    public readonly type: CarbonCreditType,
    public readonly origin: CarbonCreditOrigin,
    public readonly purchasePrice: number,
    public readonly isRetired: boolean,
    private _isLocked: boolean,
    public readonly isPurchased: boolean,
  ) {}

  lock(): void {
    this._isLocked = true;
  }
  get isLocked(): boolean {
    return this._isLocked;
  }

  static async buildFromAbsorptionCurve(
    absorptionCurve: AbsorptionCurve,
  ): Promise<CarbonCredit[]> {
    let ccs = [];
    let absDiff = 0;
    for (const point of absorptionCurve) {
      const date = new Date(point.timestamp * 1000);
      const vintage = date.getFullYear().toString();
      const toGenerate = Math.ceil((point.absorption - absDiff) / TON_IN_GRAM);
      ccs = [
        ...ccs,
        ...(await CarbonCredit.buildForVintage(vintage, toGenerate)),
      ];

      absDiff = point.absorption;
    }

    return ccs;
  }

  static async buildForVintage(
    vintage: string,
    quantity: number,
  ): Promise<CarbonCredit[]> {
    const ccs = [];
    for (let i = 0; i < quantity; i++) {
      ccs.push(
        new CarbonCredit(
          `${vintage}-${i + 1}`,
          vintage,
          CarbonCreditType.RESTORATION,
          CarbonCreditOrigin.DIRECT_PURCHASE,
          10,
          false,
          false,
          false,
        ),
      );
    }
    return ccs;
  }
}
