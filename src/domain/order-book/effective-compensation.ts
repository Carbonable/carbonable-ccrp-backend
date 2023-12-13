export class EffectiveCompensation {
  constructor(
    public readonly vintage: string,
    public readonly compensation: number,
  ) {}

  static default(): EffectiveCompensation {
    return new EffectiveCompensation('', 0);
  }
}
