import { Stock, StockRepositoryInterface } from '../../domain/order-book';

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

  async findAllocatedStockByVintage(businessUnitId: string): Promise<Stock[]> {
    const stock = this.stock.filter(
      (s) => businessUnitId === s.businessUnitId && null !== s.allocationId,
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
}
