import slugify from 'slugify';
import { BusinessUnit, Demand } from '.';

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

  static mergeDemands(businessUnits: BusinessUnit[]): Demand[] {
    // flatten all demands
    const demands = businessUnits.reduce((acc, curr) => {
      return [...acc, ...curr.getDemands()];
    }, []);
    return demands.reduce((acc: Demand[], curr: Demand) => {
      // check if demand for vintage already exists
      const existingIdx = acc.findIndex((d: Demand) => d.year === curr.year);
      if (existingIdx > -1) {
        const existingDemand = acc[existingIdx];
        // calculate target by diff of the two targets
        // 100 - ((emission*target)/100 - (emission*target)/100) * 100
        const target =
          100 -
          (((existingDemand.emission * existingDemand.target) / 100 -
            (curr.emission * curr.target) / 100) /
            (existingDemand.emission + curr.emission)) *
            100;
        return [
          ...acc.slice(0, existingIdx),
          new Demand(
            existingDemand.year,
            target,
            existingDemand.emission + curr.emission,
          ),
          ...acc.slice(existingIdx + 1),
        ];
      }

      return [...acc, curr];
    }, []);
  }
}
