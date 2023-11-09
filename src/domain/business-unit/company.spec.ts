import { BusinessUnit } from './business-unit';
import { Company } from './company';
import { ForecastEmission } from './forecast-emission';
import { ForecastTarget } from './forecast-target';

describe('Company', () => {
  it('should merge businessUnits demands', () => {
    const bu1 = new BusinessUnit(
      'bu1',
      'BusinessUnit1',
      'Business Unit 1',
      0,
      0,
      0,
      'company1',
      [],
    );
    const bu2 = new BusinessUnit(
      'bu2',
      'BusinessUnit2',
      'Business Unit 2',
      0,
      0,
      0,
      'company1',
      [],
    );
    bu1.addTargets([
      new ForecastTarget(2020, 100),
      new ForecastTarget(2021, 100),
    ]);
    bu1.addForecastEmissions([
      new ForecastEmission(2020, 1000000),
      new ForecastEmission(2021, 1000000),
    ]);
    bu2.addTargets([
      new ForecastTarget(2020, 80),
      new ForecastTarget(2021, 80),
    ]);
    bu2.addForecastEmissions([
      new ForecastEmission(2020, 1000000),
      new ForecastEmission(2021, 1000000),
    ]);
    const demands = Company.mergeDemands([bu1, bu2]);
    expect(demands.length).toBe(2);
    expect(demands[0].year).toBe('2020');
    expect(demands[0].target).toBe(90);
    expect(demands[0].emission).toBe(2000000);
    expect(demands[1].year).toBe('2021');
    expect(demands[1].target).toBe(90);
    expect(demands[1].emission).toBe(2000000);
  });
});
