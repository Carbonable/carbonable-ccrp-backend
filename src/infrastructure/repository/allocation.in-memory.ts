import {
  Allocation,
  AllocationRepositoryInterface,
} from '../../domain/allocation';

export class InMemoryAllocationRepository
  implements AllocationRepositoryInterface
{
  constructor(private allocations: Array<Allocation> = []) {}
  async findByIds(ids: string[]): Promise<Allocation[]> {
    return this.allocations.filter((a) => ids.includes(a.id));
  }
  async save(allocation: Allocation): Promise<void> {
    this.allocations = [...this.allocations, allocation];
  }
}
