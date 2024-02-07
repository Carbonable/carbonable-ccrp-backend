import { Demand } from '../../business-unit';
import { EffectiveCompensation, Stock } from '../../order-book';

type NetZeroStockVisualization = {
  vintage: string;
  exAnteCount: number;
  exPostCount: number;
  emission: number;
  target: number;
  actual: number;
  retired: number;
  consumed: number;
};
export class NetZeroStockExtractor {
  extract(stocks: Stock[]): NetZeroStockVisualization[] {
    // sort stock as this may not be properly sorted out
    stocks = stocks.sort((a, b) =>
      parseInt(a.vintage) < parseInt(b.vintage) ? -1 : 1,
    );
    // total amount of cc throughout all stock
    const total = stocks.reduce(
      (acc, curr) => acc + curr.quantity + curr.purchased,
      0,
    );

    return stocks.reduce((acc, curr) => {
      const last = acc[acc.length - 1];

      const lastExPostCount = last ? last.exPostCount : 0;
      // INFO: Display real exPost stock
      const exPostCount =
        lastExPostCount + curr.quantity + curr.purchased - curr.consumed;

      // remove (year - 1) retired + consumed to exPost and exAnte
      if (last && last.vintage === curr.vintage) {
        return [
          ...acc.slice(0, acc.length - 1),
          {
            ...last,
            exAnteCount: total - exPostCount - last.retired,
            exPostCount,
            retired: last.retired + curr.consumed,
            consumed: last.consumed + curr.consumed,
          },
        ];
      }

      acc.push({
        vintage: curr.vintage,
        exAnteCount: total - exPostCount - (last?.retired ?? 0),
        exPostCount,
        emission: 0,
        target: 0,
        actual: 0,
        retired: (last?.retired ?? 0) + curr.consumed,
        consumed: curr.consumed,
      });
      return acc;
    }, []);
  }

  aggregate(
    visualizations: NetZeroStockVisualization[],
    demands: Demand[],
    actuals: EffectiveCompensation[],
  ): NetZeroStockVisualization[] {
    return visualizations.map((v) => {
      const demand = demands.find((d) => d.year === v.vintage);
      const compensation = actuals
        .filter((d) => d.vintage === v.vintage)
        .reduce(
          (acc, curr) => ({
            ...acc,
            compensation: acc.compensation + curr.compensation,
          }),
          { vintage: v.vintage, compensation: 0 },
        );

      if (demand) {
        v.emission = demand.emission;
        v.target = demand.target;
      }
      if (compensation && demand?.target > 0) {
        const compensationPercentage = (v.consumed / demand.emission) * 100;
        v.actual = compensationPercentage;
      }
      return v;
    });
  }
}
