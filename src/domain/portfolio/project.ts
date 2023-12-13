import slugify from 'slugify';
import { CarbonCredit, Vintage } from '.';
import { MetadataParser } from '../common';
import { Metadata } from '../common/metadata-parser';

export class Project {
  private _metadata: Metadata<string, string>[];
  public readonly slug: string;
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    private _carbonCredits: Array<CarbonCredit> = [],
    private _vintages: Array<Vintage> = [],
    metadata = '',
    slug = '',
  ) {
    this._metadata = MetadataParser.parse(metadata);
    if ('' === slug) {
      this.slug = slugify(name.toLowerCase());
    }
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
