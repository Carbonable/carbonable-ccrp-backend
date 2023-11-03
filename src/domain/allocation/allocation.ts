export class Allocation {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly businessUnitId: string,
    public readonly amount: number,
  ) {}
}
