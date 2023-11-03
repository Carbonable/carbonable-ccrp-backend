import { Stock, StockRepositoryInterface } from '.';
import { Allocation } from '../allocation';
import { BusinessUnit } from '../business-unit';
import { IdGeneratorInterface } from '../common';
import { Project } from '../portfolio';

const NOT_ENOUGH_STOCK = 'Not enough stock in vintage to allocate';

export class StockManager {
  constructor(
    private readonly stockRepository: StockRepositoryInterface,
    private readonly idGenerator: IdGeneratorInterface,
  ) {}
  async createStockFor(
    allocation: Allocation,
    project: Project,
    businessUnit: BusinessUnit,
  ): Promise<void> {
    for (const vintage of project.vintages) {
      const quantity = vintage.capacity;

      // find existing stock
      const stocks = await this.stockRepository.findProjectStockForVintage(
        project.id,
        vintage.year,
      );

      if (0 === stocks.length) {
        const splitStock = (quantity * allocation.amount) / 100;
        const remaining = quantity - splitStock;
        vintage.lock(splitStock);
        const availableStock = new Stock(
          this.idGenerator.generate(),
          businessUnit.id,
          project.id,
          vintage.year,
          remaining,
          null,
        );
        const reservedStock = new Stock(
          this.idGenerator.generate(),
          businessUnit.id,
          project.id,
          vintage.year,
          splitStock,
          allocation.id,
        );
        await this.stockRepository.save([availableStock, reservedStock]);
        continue;
      }

      const availableStock = stocks.find((s) => null === s.allocationId);
      if (availableStock.quantity < allocation.amount) {
        throw new Error(NOT_ENOUGH_STOCK);
      }

      availableStock.quantity -= allocation.amount;
      const splitStock = (availableStock.quantity * allocation.amount) / 100;
      const reservedStock = new Stock(
        this.idGenerator.generate(),
        businessUnit.id,
        project.id,
        vintage.year,
        splitStock,
        allocation.id,
      );
      await this.stockRepository.save([availableStock, reservedStock]);
    }
  }
}
