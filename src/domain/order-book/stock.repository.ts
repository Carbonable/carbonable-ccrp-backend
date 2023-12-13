import { Stock } from '.';
import { Demand } from '../business-unit';
import { StockAvailability } from './stock';

export interface StockRepositoryInterface {
  findProjectStockForVintage(
    projectId: string,
    vintage: string,
  ): Promise<Stock[]>;
  findAllocatedStockByVintage(
    businessUnitId: string,
    allocationIds: string[],
  ): Promise<Stock[]>;
  save(stock: Stock[]): Promise<void>;
  reserve(stock: Stock, quantity: number): Promise<void>;

  findCompanyStock(companyId: string): Promise<Stock[]>;
  findBusinessUnitStock(businessUnitId: string): Promise<Stock[]>;
  findProjectStock(projectId: string): Promise<Stock[]>;

  availableToAllocate(
    projectId: string,
    demands: Demand[],
  ): Promise<StockAvailability>;
}
