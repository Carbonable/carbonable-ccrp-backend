import { Demand } from '../../business-unit';
import { EffectiveCompensation, Stock, Reservation } from '../../order-book';

type NetZeroStockVisualization = {
  vintage: string;
  exAnteCount: number;
  exPostCount: number;
  exPostSum: number;
  emission: number;
  target: number;
  actual: number;
  retired: number;
  consumed: number;
};
export class NetZeroStockExtractor {
  extract(
    stocks: Stock[],
    reservations: Reservation[] = [],
  ): NetZeroStockVisualization[] {
    // sort stock as this may not be properly sorted out
    stocks = stocks.sort((a, b) =>
      parseInt(a.vintage) < parseInt(b.vintage) ? -1 : 1,
    );
    reservations = reservations.sort((a, b) =>
      parseInt(a.vintage) < parseInt(b.vintage) ? -1 : 1,
    );
    // total amount of cc throughout all stock
    const total = stocks.reduce(
      (acc, curr) => acc + curr.quantity + curr.purchased,
      0,
    );

    return stocks.reduce((acc, curr) => {
      const last = acc[acc.length - 1];
      const retired = reservations
        .filter((r) => r.reservedFor === curr.vintage)
        .reduce((acc, curr) => acc + curr.count, 0);
      const consumed = reservations
        .filter((r) => parseInt(r.reservedFor) <= parseInt(curr.vintage))
        .reduce((acc, curr) => acc + curr.count, 0);

      const currentExPost = curr.quantity + curr.purchased;
      const lastExPostCount = last ? last.exPostCount : 0;
      const exPostCount = lastExPostCount + currentExPost;
      const lastExPostSum = last ? last.exPostSum : 0;
      const exPostSum = lastExPostSum + currentExPost;

      // remove (year - 1) retired + consumed to exPost and exAnte
      if (last && last.vintage === curr.vintage) {
        return [
          ...acc.slice(0, acc.length - 1),
          {
            ...last,
            exAnteCount: last.exAnteCount - currentExPost,
            exPostCount,
            exPostSum,
          },
        ];
      }

      acc.push({
        vintage: curr.vintage,
        exAnteCount: total - exPostSum,
        exPostCount: exPostSum - (last?.consumed ?? 0),
        exPostSum,
        emission: 0,
        target: 0,
        actual: 0,
        retired,
        consumed,
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
