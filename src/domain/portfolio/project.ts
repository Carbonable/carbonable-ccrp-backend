import { CarbonCredit, Vintage } from '.';
import { MetadataParser } from '../common';
import { Metadata } from '../common/metadata-parser';

export class Project {
  private _metadata: Metadata<string, string>[];
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    private _carbonCredits: Array<CarbonCredit> = [],
    private _vintages: Array<Vintage> = [],
    metadata = '',
  ) {
    this._metadata = MetadataParser.parse(metadata);
  }

  async getAvailableCarbonCredits(): Promise<Array<CarbonCredit>> {
    return this._carbonCredits.filter((cc) => !cc.isLocked);
  }

  get vintages(): Array<Vintage> {
    return this._vintages;
  }
  get metadata(): Metadata<string, string>[] {
    return this._metadata;
  }

  addCarbonCredits(cc: Array<CarbonCredit>): void {
    this._carbonCredits = [...this._carbonCredits, ...cc];
  }
}
