import { Allocation } from './allocation';

export interface AllocationRepositoryInterface {
  findByIds(ids: string[]): Promise<Allocation[]>;
  save(allocation: Allocation): Promise<void>;
}
