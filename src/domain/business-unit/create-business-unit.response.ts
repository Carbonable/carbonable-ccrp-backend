export class CreateBusinessUnitResponse {
  constructor(
    public readonly id: string,
    public readonly errors: Array<string> = [],
  ) {}
}
