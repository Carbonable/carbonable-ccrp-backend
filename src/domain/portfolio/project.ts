import { CarbonCredit, Vintage } from '.';

export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    private _carbonCredits: Array<CarbonCredit> = [],
    private _vintages: Array<Vintage> = [],
  ) {}

  async getAvailableCarbonCredits(): Promise<Array<CarbonCredit>> {
    return this._carbonCredits.filter((cc) => !cc.isLocked);
  }

  get vintages(): Array<Vintage> {
    return this._vintages;
  }

  addCarbonCredits(cc: Array<CarbonCredit>): void {
    this._carbonCredits = [...this._carbonCredits, ...cc];
  }
}
