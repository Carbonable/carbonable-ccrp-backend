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
      const totalPurchasedAmount = s.purchased * s.purchasedPrice;
      const totalIssuedAmount = s.issued * s.issuedPrice;
      return {
        year: s.vintage,
        purchasedPrice: s.purchasedPrice,
        cumulativePurchasedPrice: 0,
        totalPurchasedAmount,
        cumulativeTotalPurchasedAmount: 0,
        issuedPrice: s.issuedPrice,
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
        return [curr];
      }
      curr = this.cumulate(previous, curr);
      return [...acc.slice(0, acc.length - 1), curr];
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
}
