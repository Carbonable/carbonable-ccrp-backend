export type AllocationRequestInput = {
  projectId?: string;
  projectName?: string;
  businessUnitId: string;
  amount: number;
};

export class AddAllocationRequest {
  constructor(public readonly allocations: Array<AllocationRequestInput>) {}
}
