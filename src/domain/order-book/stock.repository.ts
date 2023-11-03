import { Stock } from '.';

export interface StockRepositoryInterface {
  findProjectStockForVintage(
    projectId: string,
    vintage: string,
  ): Promise<Stock[]>;
  findAllocatedStockByVintage(businessUnitId: string): Promise<Stock[]>;
  save(stock: Stock[]): Promise<void>;
  reserve(stock: Stock, quantity: number): Promise<void>;
}
