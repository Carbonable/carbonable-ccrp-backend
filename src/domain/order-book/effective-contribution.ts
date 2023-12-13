export class EffectiveContribution {
  constructor(
    public readonly vintage: string,
    public readonly contribution: number,
  ) {}

  static default(): EffectiveContribution {
    return new EffectiveContribution('', 0);
  }
}
