import { InMemoryStockRepository } from '../../infrastructure/repository/stock.in-memory';
import { Allocation } from '../../domain/allocation';
interface CountProps {
  total: number;
  base: number;
  allocated: number;
}
export function validateStockForAllocation(
  stockRepository: InMemoryStockRepository,
  businessId: string,
  allocations: Allocation[],
  count: CountProps,
) {
  for (const allocation of allocations) {
    // Hard filtering on stock collection for given projectId + quantity > 0 => ignore empty vintages
    const stock = stockRepository.stock.filter(
      (s) => s.projectId === allocation.projectId && s.quantity > 0,
    );
    const baseStock = stock.filter(
      (s) => s.businessUnitId === null && s.allocationId === null,
    );
    const allocatedStock = stock.filter(
      (s) =>
        s.businessUnitId === businessId && s.allocationId === allocation.id,
    );
    expect(stock.length).toBe(count.total);
    expect(baseStock.length).toBe(count.base);
    expect(allocatedStock.length).toBe(count.allocated);

    const totalQuantity = baseStock.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );
    const totalAllocated = allocatedStock.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );
    const totalLocked = baseStock.reduce((acc, curr) => acc + curr.consumed, 0);

    expect(totalQuantity).toBe(totalAllocated + totalLocked);
  }
}
