import { Demand } from '../../domain/business-unit';
import {
  Stock,
  StockRepositoryInterface,
  StockAndReservation,
} from '../../domain/order-book';
import { StockAvailability } from '../../domain/order-book/stock';

export class InMemoryStockRepository implements StockRepositoryInterface {
  constructor(public stock: Stock[] = []) {}
  async findProjectStockForVintage(
    projectId: string,
    vintage: string,
  ): Promise<Stock[]> {
    return this.stock.filter(
      (s) => projectId === s.projectId && vintage === s.vintage,
    );
  }

  async findAllocatedStockByVintage(
    businessUnitId: string,
    allocationIds: string[],
  ): Promise<Stock[]> {
    const stock = this.stock.filter(
      (s) =>
        businessUnitId === s.businessUnitId &&
        allocationIds.includes(s.allocationId),
    );
    return stock.sort((a, b) =>
      parseInt(a.vintage) < parseInt(b.vintage) ? -1 : 1,
    );
  }

  async save(stock: Stock[]): Promise<void> {
    for (const s of stock) {
      if (!this.stock.includes(s)) {
        this.stock.push(s);
      }
    }
  }

  async reserve(stock: Stock, quantity: number): Promise<void> {
    const s = this.stock.find((s) => s.id === stock.id);
    s.lock(quantity);
  }

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findCompanyStock(companyId: string): Promise<StockAndReservation> {
    throw new Error('Operation not supported');
  }
  async findBusinessUnitStock(
    businessUnitId: string,
  ): Promise<StockAndReservation> {
    return {
      stock: this.stock.filter((s) => s.businessUnitId === businessUnitId),
      reservations: [],
    };
  }
  async findProjectStock(projectId: string): Promise<StockAndReservation> {
    return {
      stock: this.stock.filter((s) => s.projectId === projectId),
      reservations: [],
    };
  }

  async availableToAllocate(
    projectId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    demands: Demand[],
  ): Promise<StockAvailability> {
    const stock = this.stock.filter((s) => s.projectId === projectId);
    // TODO: get available stock based on demands

    return {
      percentage: 100,
      units: stock.reduce((acc, curr) => acc + curr.available, 0),
    };
  }
}
