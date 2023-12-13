import { Logger } from '@nestjs/common';
import { Stock, StockRepositoryInterface } from '.';
import { Allocation } from '../allocation';
import { BusinessUnit } from '../business-unit';
import { IdGeneratorInterface } from '../common';
import { Project } from '../portfolio';

export class StockManager {
  private readonly logger = new Logger(StockManager.name);
  constructor(
    private readonly stockRepository: StockRepositoryInterface,
    private readonly idGenerator: IdGeneratorInterface,
  ) {}

  // in charge of splitting available stock based on allocation amount which is a percentage
  async createStockFor(
    allocation: Allocation,
    project: Project,
    businessUnit: BusinessUnit,
  ): Promise<void> {
    for (const vintage of project.vintages) {
      // find existing stock (created at project creation with vintage)
      // stock available === vintage
      const stocks = await this.stockRepository.findProjectStockForVintage(
        project.id,
        vintage.year,
      );

      // stock that is not allocated does not have an allocation id, this is the  rest of what is available
      const availableStock = stocks.find((s) => null === s.allocationId);
      if (availableStock === undefined || 0 === availableStock.available) {
        // go on to the next year as there is no stock available
        continue;
      }

      // keep in mind that the allocation amount is a percentage
      const splitStock = (availableStock.available * allocation.amount) / 100;
      availableStock.lock(splitStock);
      const reservedStock = new Stock(
        this.idGenerator.generate(),
        businessUnit.id,
        project.id,
        vintage.year,
        splitStock,
        allocation.id,
        availableStock.purchased,
        availableStock.purchasedPrice,
        availableStock.issuedPrice,
      );

      await this.stockRepository.save([availableStock, reservedStock]);
    }
  }
}
