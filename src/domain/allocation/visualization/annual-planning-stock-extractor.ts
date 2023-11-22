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
    return stocks.map((stock) => {
      const demand =
        demands.find((d) => d.year === stock.vintage) || Demand.default();
      const order =
        orders.find((o) => o.year === stock.vintage) || Order.default();

      return {
        timePeriod: stock.vintage,
        emissions: demand.emission,
        exPostIssued: stock.quantity,
        exPostPurchased: stock.purchased,
        exPostRetired: stock.retired,
        target: demand.target,
        actualRate: order.actualRate,
        delta: demand.target - order.actualRate,
        debt: order.debt,
        exPostStock,
        exAnteStock,
      };
    });
  }
}
