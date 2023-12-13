import { Demand } from '../../business-unit';
import { Order, Stock } from '../../order-book';
import {
  exPostStock as exPostStockComputer,
  exAnteStock as exAnteStockComputer,
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
};

export class AnnualPlanningStockExtractor {
  extract(
    stocks: Stock[],
    demands: Demand[],
    orders: Order[],
  ): AnnualPlanningVisualization[] {
    const currentYear = new Date().getFullYear();
    const exPostStock = exPostStockComputer(stocks, currentYear);
    const exAnteStock = exAnteStockComputer(stocks, currentYear);
    return stocks.reduce((acc, curr) => {
      const demand =
        demands.find((d) => d.year === curr.vintage) || Demand.default();
      const order =
        orders.find((o) => o.year === curr.vintage) || Order.default();

      const existant = acc.find((a) => a.timePeriod === curr.vintage);
      if (existant) {
        const existantIdx = acc.findIndex((a) => a.timePeriod === curr.vintage);
        existant.exPostIssued += curr.quantity;
        existant.exPostPurchased += curr.purchased;
        existant.exPostRetired += curr.retired;
        existant.exPostStock += exPostStock;
        existant.exAnteStock += exAnteStock;

        return [
          ...acc.slice(0, existantIdx),
          existant,
          ...acc.slice(existantIdx + 1),
        ];
      }

      acc.push({
        timePeriod: curr.vintage,
        emissions: demand.emission,
        exPostIssued: curr.quantity,
        exPostPurchased: curr.purchased,
        exPostRetired: curr.retired,
        target: demand.target,
        actualRate: order.actualRate,
        delta: demand.target - order.actualRate,
        debt: order.debt,
        exPostStock,
        exAnteStock,
      });
      return acc;
    }, []);
  }
}
