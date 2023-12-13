export const ALLOCATION_FINISHED = 'allocations.finished';
export class AllocationFinished {
  constructor(public readonly ids: string[]) {}
}
