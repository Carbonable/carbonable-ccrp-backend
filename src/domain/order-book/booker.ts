import { Stock, StockRepositoryInterface } from '.';
import { Allocation, AllocationRepositoryInterface } from '../allocation';
import {
  BusinessUnit,
  BusinessUnitRepositoryInterface,
} from '../business-unit';
import { IdGeneratorInterface, UlidIdGenerator } from '../common';
import { ProjectRepositoryInterface } from '../portfolio';
import { Order, OrderStatus } from './order';
import { OrderBookRepositoryInterface } from './order-book.repository';

export const TON_IN_GRAM = 1000000;

export class Booker {
  constructor(
    private readonly orderBookRepository: OrderBookRepositoryInterface,
    private readonly allocationRepository: AllocationRepositoryInterface,
    private readonly projectRepository: ProjectRepositoryInterface,
    private readonly businessUnitRepository: BusinessUnitRepositoryInterface,
    private readonly stockRepository: StockRepositoryInterface,
    private readonly idGenerator: IdGeneratorInterface = new UlidIdGenerator(),
  ) {}

  // create order for each target + allocation
  // the base point of orders are business units (one business unit can have multiple allocations)
  // find all stock for businessunit + allocations
  //
  // using allocation try to fullfill order to compensate target qty
  // create order + reservation
  // save orders
  // allocation is uniquely created every update on targets, emissions and allocations retriggers future orders placement
  async placeOrders(allocationIds: string[]): Promise<void> {
    const allocations = await this.allocationRepository.findByIds(
      allocationIds,
    );

    // group allocations by business unit
    const grouped = allocations.reduce((acc, curr) => {
      const businessUnitId = curr.businessUnitId;
      if (!acc.hasOwnProperty(businessUnitId)) {
        acc[businessUnitId] = [];
      }
      acc[businessUnitId] = [...acc[businessUnitId], curr];
      return acc;
    }, {});

    for (const businessUnitId in grouped) {
      const allocations = grouped[businessUnitId];
      const businessUnit = await this.businessUnitRepository.byId(
        businessUnitId,
      );

      // all stock for every allocations ordered by vintage.
      const stocks = await this.stockRepository.findAllocatedStockByVintage(
        businessUnit.id,
        allocations.map((a) => a.id),
      );

      await this.placeOrdersForAllocation(businessUnit, allocations, stocks);
    }
  }

  private async placeOrdersForAllocation(
    businessUnit: BusinessUnit,
    allocations: Allocation[],
    stock: Stock[],
  ): Promise<void> {
    // Check every target of business unit
    const demands = businessUnit.getDemands();
    if (0 === demands.length) {
      throw new Error(
        `Configuration incorrect for businessUnit id : ${businessUnit.id}`,
      );
    }

    for (const demand of demands) {
      // in cc unit
      let quantityForDemand = (demand.emission * demand.target) / 100;

      // The idea here is to consume cc's until demand is fullfilled.
      // from bottom up, take every ccs of lower vintage until all are consumed
      for (const item of stock) {
        if (quantityForDemand <= 0) {
          continue;
        }

        // get quantity expressed in carbon units to order
        // based on demand emission and target
        const availableQuantity = item.available;

        const quantity =
          availableQuantity < quantityForDemand
            ? availableQuantity
            : quantityForDemand;

        let order = null;
        try {
          order = await this.orderBookRepository.findOrderForDemand(
            businessUnit.id,
            demand.year,
          );
        } catch (err) {
          order = new Order(
            this.idGenerator.generate(),
            quantityForDemand,
            demand.year,
            businessUnit.id,
            OrderStatus.OPEN,
            [],
            [],
          );
        }

        await order.reserve(this.idGenerator, demand.year, item);
        await this.orderBookRepository.save([order]);
        await this.stockRepository.reserve(item, quantity);

        quantityForDemand -= quantity;
      }
    }
  }
}
