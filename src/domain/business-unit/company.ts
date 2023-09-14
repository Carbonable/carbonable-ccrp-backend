import { BusinessUnit } from '.';

export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly businessUnits: Array<BusinessUnit> = [],
  ) {}

  addBusinessUnit(businessUnit: BusinessUnit): void {
    this.businessUnits.push(businessUnit);
  }
}
