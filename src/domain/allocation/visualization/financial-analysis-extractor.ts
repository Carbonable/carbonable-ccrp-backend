import Utils from '../../../utils';
import { Stock } from '../../order-book';

export type FinancialAnalysisItem = {
  year: string;
  purchasedPrice: number;
  cumulativePurchasedPrice: number;
  totalPurchasedAmount: number;
  cumulativeTotalPurchasedAmount: number;
  issuedPrice: number;
  averageIssuedPrice: number;
  totalIssuedAmount: number;
  cumulativeTotalIssuedAmount: number;
  granTotalAmount: number;
  cumulativeGranTotalAmount: number;
  estimatedDebtAmount: number;
  cumulativeEstimatedDebtAmount: number;
};

function defaultFinancialAnalysisItem(): FinancialAnalysisItem {
  return {
    year: '',
    purchasedPrice: 0,
    cumulativePurchasedPrice: 0,
    totalPurchasedAmount: 0,
    cumulativeTotalPurchasedAmount: 0,
    issuedPrice: 0,
    averageIssuedPrice: 0,
    totalIssuedAmount: 0,
    cumulativeTotalIssuedAmount: 0,
    granTotalAmount: 0,
    cumulativeGranTotalAmount: 0,
    estimatedDebtAmount: 0,
    cumulativeEstimatedDebtAmount: 0,
  };
}

export class FinancialAnalysisExtractor {
  extract(stock: Stock[]): FinancialAnalysisItem[] {
    const items = stock.map((s) => {
      // prices are stored as ints with 4 digits. divide by 100 to keep 2 digits precision
      const totalPurchasedAmount =
        s.purchased * Utils.priceDecimal(s.purchasedPrice);
      const totalIssuedAmount = s.issued * Utils.priceDecimal(s.issuedPrice);
      return {
        year: s.vintage,
        purchasedPrice: Utils.priceDecimal(s.purchasedPrice),
        cumulativePurchasedPrice: 0,
        totalPurchasedAmount,
        cumulativeTotalPurchasedAmount: 0,
        issuedPrice: Utils.priceDecimal(s.issuedPrice),
        // TODO: check how this is calculated
        averageIssuedPrice: 0,
        totalIssuedAmount,
        cumulativeTotalIssuedAmount: 0,
        granTotalAmount: totalPurchasedAmount + totalIssuedAmount,
        cumulativeGranTotalAmount: 0,
        estimatedDebtAmount: 0,
        cumulativeEstimatedDebtAmount: 0,
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
      cumulativePurchasedPrice:
        curr.purchasedPrice + previous.cumulativePurchasedPrice,
      cumulativeTotalPurchasedAmount:
        curr.totalPurchasedAmount + previous.cumulativeTotalPurchasedAmount,
      cumulativeTotalIssuedAmount:
        curr.totalIssuedAmount + previous.cumulativeTotalIssuedAmount,
      cumulativeGranTotalAmount:
        curr.granTotalAmount + previous.cumulativeGranTotalAmount,
      cumulativeEstimatedDebtAmount:
        curr.estimatedDebtAmount + previous.cumulativeEstimatedDebtAmount,
    };
  }

  merge(
    lhs: FinancialAnalysisItem,
    rhs: FinancialAnalysisItem,
  ): FinancialAnalysisItem {
    return {
      year: lhs.year,
      purchasedPrice: lhs.purchasedPrice + rhs.purchasedPrice,
      cumulativePurchasedPrice:
        lhs.cumulativePurchasedPrice + rhs.cumulativePurchasedPrice,
      totalPurchasedAmount: lhs.totalPurchasedAmount + rhs.totalPurchasedAmount,
      cumulativeTotalPurchasedAmount:
        lhs.cumulativeTotalPurchasedAmount + rhs.cumulativeTotalPurchasedAmount,
      issuedPrice: lhs.issuedPrice + rhs.issuedPrice,
      averageIssuedPrice: lhs.averageIssuedPrice + rhs.averageIssuedPrice,
      totalIssuedAmount: lhs.totalIssuedAmount + rhs.totalIssuedAmount,
      cumulativeTotalIssuedAmount:
        lhs.cumulativeTotalIssuedAmount + rhs.cumulativeTotalIssuedAmount,
      granTotalAmount: lhs.granTotalAmount + rhs.granTotalAmount,
      cumulativeGranTotalAmount:
        lhs.cumulativeGranTotalAmount + rhs.cumulativeGranTotalAmount,
      estimatedDebtAmount: lhs.estimatedDebtAmount + rhs.estimatedDebtAmount,
      cumulativeEstimatedDebtAmount:
        lhs.cumulativeEstimatedDebtAmount + rhs.cumulativeEstimatedDebtAmount,
    };
  }
}
