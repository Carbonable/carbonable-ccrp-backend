export class AddAllocationResponse {
  constructor(
    public readonly allocationIds: Array<string>,
    public readonly errors: Array<string> = [],
  ) {}
}
