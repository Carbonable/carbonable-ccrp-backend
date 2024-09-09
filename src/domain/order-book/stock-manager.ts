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

      // INFO: keep in mind that the allocation amount is a percentage
      // splitStock is the amount of stock required to fulfill allocation
      const splitStock = Math.round(
        (availableStock.available * allocation.amount) / 100,
      );

      availableStock.lock(splitStock);
      // After locking stock, we want to get the rest.
      const purchasedCount = availableStock.purchased - splitStock;
      const issuedCount = availableStock.quantity - splitStock;
      this.logger.log(
        `Locked ${splitStock} units for project ${project.id}, vintage ${vintage.year}`,
      );
      // Checking reserved stock is not negative
      // we can have either a purchased stock or an issued but not both
      const purchased = purchasedCount > 0 ? purchasedCount : 0;
      const issued = issuedCount > 0 ? splitStock : 0;

      const reservedStock = new Stock(
        this.idGenerator.generate(),
        businessUnit.id,
        project.id,
        vintage.year,
        issued,
        allocation.id,
        purchased,
        availableStock.purchasedPrice,
        availableStock.issuedPrice,
      );

      await this.stockRepository.save([availableStock, reservedStock]);
    }
  }
}
