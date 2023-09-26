import slugify from 'slugify';
import { BusinessUnit } from '.';

export class Company {
  public readonly slug: string;
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly businessUnits: Array<BusinessUnit> = [],
  ) {
    this.slug = slugify(name).toLowerCase();
  }

  addBusinessUnit(businessUnit: BusinessUnit): void {
    this.businessUnits.push(businessUnit);
  }
}
