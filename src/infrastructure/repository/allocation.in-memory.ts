import {
  Allocation,
  AllocationRepositoryInterface,
} from '../../domain/allocation';

export class InMemoryAllocationRepository
  implements AllocationRepositoryInterface
{
  constructor(public allocations: Array<Allocation> = []) {}
  async findByIds(ids: string[]): Promise<Allocation[]> {
    return this.allocations.filter((a) => ids.includes(a.id));
  }
  async save(allocation: Allocation): Promise<void> {
    this.allocations = [...this.allocations, allocation];
  }

  async flushAllocationsExcept(ids: string[]): Promise<void> {
    this.allocations = this.allocations.filter((a) => !ids.includes(a.id));
  }
}
