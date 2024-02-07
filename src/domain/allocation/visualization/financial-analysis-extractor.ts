import Utils from '../../../utils';
import { Demand } from '../../business-unit';
import { Order, Stock } from '../../order-book';

export type FinancialAnalysisItem = {
  year: string;
  avgPurchasedPrice: number;
  avgIssuedPrice: number;
  avgPrice: number;
  totalPurchasedAmount: number;
  totalIssuedAmount: number;
  totalAmount: number;
  allTimeAvgPurchasedPrice: number;
  allTimeAvgIssuedPrice: number;
  allTimeAvgPrice: number;
  cumulativeTotalAmount: number;
  emissionDebt: number;
  cumulativeEmissionDebt: number;
};

function defaultFinancialAnalysisItem(): FinancialAnalysisItem {
  return {
    year: '',
    avgPurchasedPrice: 0,
    avgIssuedPrice: 0,
    avgPrice: 0,
    totalPurchasedAmount: 0,
    totalIssuedAmount: 0,
    totalAmount: 0,
    allTimeAvgPurchasedPrice: 0,
    allTimeAvgIssuedPrice: 0,
    allTimeAvgPrice: 0,
    cumulativeTotalAmount: 0,
    emissionDebt: 0,
    cumulativeEmissionDebt: 0,
  };
}

export function avg(numbers: number[]): number {
  const coeff = numbers.reduce((acc, curr) => acc + (curr > 0 ? 1 : 0), 0);
  if (coeff === 0) {
    return 0;
  }
  return numbers.reduce((acc, curr) => acc + curr, 0) / coeff;
}

export class FinancialAnalysisExtractor {
  extract(
    stock: Stock[],
    demands: Demand[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orders: Order[],
  ): FinancialAnalysisItem[] {
    const items = stock.map((s) => {
      const demand =
        demands.find((d) => d.year === s.vintage) || Demand.default();
      const targetInTon = demand.emission * (demand.target / 100);

      // prices are stored as ints with 4 digits. divide by 100 to keep 2 digits precision
      const totalPurchasedAmount =
        s.purchased * Utils.priceDecimal(s.purchasedPrice);
      const totalIssuedAmount = s.issued * Utils.priceDecimal(s.issuedPrice);
      const avgPrice = Utils.priceDecimal(
        avg([s.purchasedPrice, s.issuedPrice]),
      );

      return {
        year: s.vintage,
        avgPurchasedPrice: Utils.priceDecimal(s.purchasedPrice),
        avgIssuedPrice: Utils.priceDecimal(s.issuedPrice),
        avgPrice,
        totalPurchasedAmount,
        totalIssuedAmount,
        totalAmount: Utils.round(totalPurchasedAmount + totalIssuedAmount),
        allTimeAvgPurchasedPrice: 0,
        allTimeAvgIssuedPrice: 0,
        allTimeAvgPrice: 0,
        cumulativeTotalAmount: 0,
        emissionDebt: Utils.round(avgPrice * targetInTon),
        cumulativeEmissionDebt: 0,
      };
    });

    return items.reduce((acc, curr) => {
      let previous = acc[acc.length - 1];
      if (!previous) {
        previous = defaultFinancialAnalysisItem();
        return [this.cumulate(previous, curr)];
      }

      const vintage = acc.find((a) => a.year === curr.year);
      const vintageIdx = acc.findIndex((a) => a.year === curr.year);
      if (vintage) {
        curr = this.merge(vintage, curr);
        return [
          ...acc.slice(0, vintageIdx),
          curr,
          ...acc.slice(vintageIdx + 1),
        ];
      }

      curr = this.cumulate(previous, curr);
      return [...acc, curr];
    }, []);
  }

  cumulate(
    previous: FinancialAnalysisItem,
    curr: FinancialAnalysisItem,
  ): FinancialAnalysisItem {
    return {
      ...curr,
      allTimeAvgPurchasedPrice: Utils.round(
        avg([previous.allTimeAvgPurchasedPrice, curr.avgPurchasedPrice]),
      ),
      allTimeAvgIssuedPrice: Utils.round(
        avg([previous.allTimeAvgIssuedPrice, curr.avgIssuedPrice]),
      ),
      allTimeAvgPrice: Utils.round(
        avg([previous.allTimeAvgPrice, curr.avgPrice]),
      ),
      cumulativeTotalAmount: previous.cumulativeTotalAmount + curr.totalAmount,
      cumulativeEmissionDebt:
        previous.cumulativeEmissionDebt + curr.emissionDebt,
    };
  }

  merge(
    lhs: FinancialAnalysisItem,
    rhs: FinancialAnalysisItem,
  ): FinancialAnalysisItem {
    return {
      year: lhs.year,
      avgPurchasedPrice: Utils.round(
        avg([lhs.avgPurchasedPrice, rhs.avgPurchasedPrice]),
      ),
      avgIssuedPrice: Utils.round(
        avg([lhs.avgIssuedPrice, rhs.avgIssuedPrice]),
      ),
      avgPrice: Utils.round(avg([lhs.avgPrice, rhs.avgPrice])),
      totalPurchasedAmount: Utils.round(
        avg([lhs.totalPurchasedAmount, rhs.totalPurchasedAmount]),
      ),
      totalIssuedAmount: Utils.round(
        avg([lhs.totalIssuedAmount, rhs.totalIssuedAmount]),
      ),
      totalAmount: Utils.round(avg([lhs.totalAmount, rhs.totalAmount])),
      allTimeAvgPurchasedPrice: Utils.round(
        avg([lhs.allTimeAvgPurchasedPrice, rhs.allTimeAvgPurchasedPrice]),
      ),
      allTimeAvgIssuedPrice: Utils.round(
        avg([lhs.allTimeAvgIssuedPrice, rhs.allTimeAvgIssuedPrice]),
      ),
      allTimeAvgPrice: Utils.round(
        avg([lhs.allTimeAvgPrice, rhs.allTimeAvgPrice]),
      ),
      cumulativeTotalAmount: Utils.round(
        avg([lhs.cumulativeTotalAmount, rhs.cumulativeTotalAmount]),
      ),
      emissionDebt: Utils.round(avg([lhs.emissionDebt, rhs.emissionDebt])),
      cumulativeEmissionDebt: Utils.round(
        avg([lhs.cumulativeEmissionDebt, rhs.cumulativeEmissionDebt]),
      ),
    };
  }
}
