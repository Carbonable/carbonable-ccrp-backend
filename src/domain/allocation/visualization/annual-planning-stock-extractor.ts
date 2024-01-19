import Utils from '../../../utils';
import { Demand } from '../../business-unit';
import { Order, Stock } from '../../order-book';
import {
  exPostStockAvailable as exPostStockComputer,
  exAnteStockAvailable as exAnteStockComputer,
  exPostStock as exPostStockTotalComputer,
  exAnteStock as exAnteStockTotalComputer,
} from '../../order-book/stock';

export type AnnualPlanningVisualization = {
  timePeriod: string;
  emissions: number;
  exPostIssued: number;
  exPostPurchased: number;
  exPostRetired: number;
  target: number;
  actualRate: number;
  delta: number;
  debt: number;
  exPostStock: number;
  exAnteStock: number;
  totalExPost: number;
  totalExAnte: number;
};

export class AnnualPlanningStockExtractor {
  extract(
    stocks: Stock[],
    demands: Demand[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orders: Order[],
  ): AnnualPlanningVisualization[] {
    return stocks.reduce((acc, curr) => {
      const currentYear = parseInt(curr.vintage);

      const exPostStock = exPostStockComputer(stocks, currentYear);
      const exAnteStock = exAnteStockComputer(stocks, currentYear);
      const totalExPost = exPostStockTotalComputer(stocks, currentYear);
      const totalExAnte = exAnteStockTotalComputer(stocks, currentYear);

      const demand =
        demands.find((d) => d.year === curr.vintage) || Demand.default();

      const existant = acc.find((a) => a.timePeriod === curr.vintage);
      if (existant) {
        const existantIdx = acc.findIndex((a) => a.timePeriod === curr.vintage);
        existant.exPostIssued += curr.issued;
        existant.exPostPurchased += curr.purchased;
        existant.exPostRetired += curr.consumed;

        return [
          ...acc.slice(0, existantIdx),
          existant,
          ...acc.slice(existantIdx + 1),
        ];
      }

      const targetInTon = demand.emission * (demand.target / 100);
      const actualRate = Utils.round((curr.consumed / targetInTon) * 100) ?? 0;

      acc.push({
        timePeriod: curr.vintage,
        emissions: demand.emission,
        exPostIssued: curr.issued,
        exPostPurchased: curr.purchased,
        exPostRetired: curr.consumed,
        target: demand.target,
        actualRate: !isFinite(actualRate) || isNaN(actualRate) ? 0 : actualRate,
        delta: Utils.round(demand.target - actualRate) ?? 0,
        debt: targetInTon - curr.consumed,
        exPostStock,
        exAnteStock,
        totalExPost,
        totalExAnte,
      });

      return acc;
    }, []);
  }
}
